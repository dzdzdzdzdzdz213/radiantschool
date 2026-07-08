import { useState, useRef } from 'react';
import { Search, Plus, Link as LinkIcon, FileText, FolderOpen, Download, Trash2, ExternalLink, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';
import { useDownloadFile } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function ResourcesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { lang } = useLang();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const downloadFile = useDownloadFile();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['teacher_resources', profile?.id, debouncedSearch],
    queryFn: async () => {
      if (!profile?.id) return [];
      let q = (supabase as any)
        .from('resources')
        .select('id, title, description, type, file_url, created_at')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });
      const { data } = await q;
      let items = data ?? [];
      if (debouncedSearch) items = items.filter((i: any) => i.title?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      return items;
    },
    enabled: !!profile?.id,
  });

  const ALLOWED_TYPES = ['application/pdf','image/jpeg','image/png','image/webp','image/gif','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/csv','application/zip','application/x-rar-compressed','application/x-7z-compressed'];

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!profile?.id) return;
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(t('errors.mime_not_supported', lang, file.type));
      }
      const filePath = `teacher-resources/${profile.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await (supabase as any).storage.from('resources').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = (supabase as any).storage.from('resources').getPublicUrl(filePath);
      const { error: dbError } = await (supabase as any).from('resources').insert({
        teacher_id: profile.id,
        title: file.name,
        type: file.type,
        file_url: urlData.publicUrl,
        created_at: new Date().toISOString(),
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_resources'] });
      toast(t('success.created', lang, 'Fichier'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('resources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_resources'] });
      toast(t('success.deleted', lang, 'Ressource'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ title: '', description: '', url: '', course_id: '' });

  const { data: courses } = useQuery({
    queryKey: ['teacher_courses_resources', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any).from('courses').select('id, name').eq('teacher_id', profile.id);
      return data ?? [];
    },
    enabled: !!profile?.id,
  });

  const addLinkMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;
      const { error } = await (supabase as any).from('resources').insert({
        teacher_id: profile.id,
        title: linkForm.title,
        description: linkForm.description || null,
        type: 'link',
        file_url: linkForm.url,
        course_id: linkForm.course_id || null,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher_resources'] });
      setShowLinkModal(false);
      setLinkForm({ title: '', description: '', url: '', course_id: '' });
      toast(t('success.created', lang, 'Lien'), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const handleAddFile = () => fileInputRef.current?.click();

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z" onChange={(e) => { if (e.target.files?.[0]) uploadMutation.mutate(e.target.files[0]); }} />
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{t('nav.resources', lang)}</h1><p className="text-sm text-muted-foreground mt-1">{t('common.description', lang)}</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 gap-2" onClick={() => setShowLinkModal(true)} disabled={addLinkMutation.isPending}><LinkIcon className="h-4 w-4" />{t('nav.online_classes', lang)}</Button>
          <Button className="h-9 gap-2" onClick={handleAddFile} disabled={uploadMutation.isPending}><Plus className="h-4 w-4" />{uploadMutation.isPending ? t('common.loading', lang) : t('common.add', lang)}</Button>
        </div>
      </div>
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 bg-black/50" onClick={() => setShowLinkModal(false)}>
          <div className="bg-card rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('nav.online_classes', lang)}</h2>
              <button onClick={() => setShowLinkModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.name', lang)}</Label>
                <Input value={linkForm.title} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} placeholder={t('common.name', lang)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.description', lang)}</Label>
                <Input value={linkForm.description} onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))} placeholder={t('common.description', lang)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{'URL'}</Label>
                <Input value={linkForm.url} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('nav.courses', lang)}</Label>
                <select value={linkForm.course_id} onChange={e => setLinkForm(f => ({ ...f, course_id: e.target.value }))} className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <option value="">{t('common.select', lang)}</option>
                  {(courses ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowLinkModal(false)}>{t('common.cancel', lang)}</Button>
              <Button size="sm" className="h-9" disabled={!linkForm.title || !linkForm.url || addLinkMutation.isPending} onClick={() => addLinkMutation.mutate()}>
                {addLinkMutation.isPending ? t('common.loading', lang) : t('common.add', lang)}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />))
            : (resources ?? []).length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
              </div>
            ) : (resources ?? []).map((r: any) => (
              <div key={r.id} className="group rounded-xl border p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className={`h-9 w-9 rounded-lg ${r.type === 'link' ? 'bg-sky-500/10' : 'bg-primary/10'} flex items-center justify-center shrink-0`}>
                    {r.type === 'link' ? <LinkIcon className="h-4 w-4 text-sky-500" /> : <FileText className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {r.type === 'link' ? (
                      <Button variant="ghost" size="sm" className="h-7 w-7" asChild><a href={r.file_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 w-7" onClick={() => downloadFile.mutate({ fileUrl: r.file_url, filename: r.title })} disabled={downloadFile.isPending}><Download className="h-3.5 w-3.5" /></Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 text-red-500" onClick={() => setConfirmDelete({ id: r.id, name: r.title })} disabled={deleteMutation.isPending}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <h4 className="text-sm font-medium mt-3 truncate">{r.title}</h4>
                {r.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <span>{r.type === 'link' ? t('nav.online_classes', lang) : (r.type ?? t('common.type', lang))}</span>
                  <span>{formatDate(r.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
