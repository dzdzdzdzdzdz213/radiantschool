import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/contexts/LangContext';
import { useToast } from '@/hooks/useToast';
import { t } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Loader2, ShieldCheck, Trash2 } from 'lucide-react';

interface HonestyEntry {
  id: number;
  role: string;
  content: string;
  category: string | null;
  severity: number | null;
  status: string;
  ai_notes: string | null;
  created_at: string;
}

interface Theme {
  name: string;
  severity: number;
  suggestion: string;
  ids: number[];
}

const severityStyles: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  2: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
  3: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  5: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusStyles: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  clustered: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  reviewed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function HonestyBoxPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['honesty-box'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('honesty_list');
      if (error) throw error;
      return (data ?? []) as HonestyEntry[];
    },
    staleTime: 10_000,
  });

  const filtered = (entries ?? []).filter((e) => tab === 'all' || e.status === tab);

  async function generateBriefing() {
    setGenerating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/honesty-briefing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.access_token ?? ''}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? `HTTP ${res.status}`);
      setThemes(result.themes ?? []);
      toast(`${result.clustered ?? 0} messages analysés`, 'success');
      queryClient.invalidateQueries({ queryKey: ['honesty-box'] });
    } catch (e) {
      toast(String((e as Error)?.message ?? e), 'error');
    } finally {
      setGenerating(false);
    }
  }

  async function setStatus(id: number, status: string) {
    const { error } = await supabase.rpc('honesty_set_status', { p_id: id, p_status: status });
    if (error) {
      toast(error.message, 'error');
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['honesty-box'] });
  }

  async function remove(id: number) {
    const { error } = await supabase.rpc('honesty_delete', { p_id: id });
    if (error) {
      toast(error.message, 'error');
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['honesty-box'] });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('honesty.admin_title', lang)}</h1>
            <p className="text-sm text-muted-foreground">{t('honesty.admin_subtitle', lang)}</p>
          </div>
        </div>
        <Button onClick={generateBriefing} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {generating ? t('honesty.generating', lang) : t('honesty.generate_briefing', lang)}
        </Button>
      </div>

      {themes.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {themes.map((theme) => (
            <Card key={theme.name} className="border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  {theme.name}
                  <Badge className={severityStyles[theme.severity] ?? ''}>S{theme.severity}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-1">{theme.suggestion}</p>
                <p className="text-xs text-muted-foreground/70">{theme.ids.length} message(s)</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Tous ({entries?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="new">{t('honesty.status.new', lang)}</TabsTrigger>
          <TabsTrigger value="clustered">{t('honesty.status.clustered', lang)}</TabsTrigger>
          <TabsTrigger value="reviewed">{t('honesty.status.reviewed', lang)}</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !filtered.length ? (
                <div className="p-10 text-center text-muted-foreground">{t('honesty.no_submissions', lang)}</div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((entry) => (
                    <div key={entry.id} className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {entry.role === 'parent' ? t('honesty.role.parent', lang) : t('honesty.role.student', lang)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t('honesty.anonymous', lang)} · {new Date(entry.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                        </span>
                        {entry.category && <Badge>{entry.category}</Badge>}
                        {entry.severity != null && (
                          <Badge className={severityStyles[entry.severity] ?? ''}>S{entry.severity}</Badge>
                        )}
                        <Badge className={statusStyles[entry.status] ?? ''}>{t(`honesty.status.${entry.status}`, lang)}</Badge>
                        <div className="ml-auto flex items-center gap-2">
                          {entry.status !== 'reviewed' && (
                            <Button variant="ghost" size="sm" onClick={() => setStatus(entry.id, 'reviewed')}>
                              {t('honesty.mark_reviewed', lang)}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{entry.content}</p>
                      {entry.ai_notes && (
                        <p className="mt-2 text-xs text-violet-600 dark:text-violet-400 italic">{entry.ai_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
