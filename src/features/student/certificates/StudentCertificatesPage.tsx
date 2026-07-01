import { Award, Download, Calendar, BookOpen, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function StudentCertificatesPage() {
  const { profile } = useAuth();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['student_certificates', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('certificates')
        .select('id, title, description, issued_date, expiry_date, certificate_url, course:courses(name)')
        .eq('student_id', profile.id)
        .order('issued_date', { ascending: false });
      return (data ?? []).map((c: any) => ({ ...c, courseName: c.course?.name ?? '' }));
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Mes certificats</h1><p className="text-sm text-muted-foreground mt-1">{certificates?.length ?? 0} certificat(s) obtenu(s)</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-44 rounded-xl" />))
        : (certificates ?? []).length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-muted-foreground">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" /><p className="text-lg font-medium">Aucun certificat</p><p className="text-sm">Terminez vos cours pour obtenir des certificats</p>
          </div>
        ) : (certificates ?? []).map((c: any) => (
          <Card key={c.id} className="border-2 border-amber-200 dark:border-amber-900/50 hover:shadow-lg transition-all group">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
                <Award className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <Badge variant="outline" className="mt-2 text-[10px]">{c.courseName}</Badge>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.description ?? ''}</p>
              <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(c.issued_date)}</span>
                {c.expiry_date && <span className="flex items-center gap-1">Expire {formatDate(c.expiry_date)}</span>}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-xs gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Download className="h-3.5 w-3.5" />Télécharger
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}