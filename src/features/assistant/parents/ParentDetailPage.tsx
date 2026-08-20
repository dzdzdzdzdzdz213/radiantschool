import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getFullName, formatDate, getStatusColor } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Mail, Phone, User, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useStudents } from '@/features/assistant/students/useStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export default function ParentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: parent, isLoading, isError } = useQuery({
    queryKey: ['parent-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Parent not found');
      return data;
    },
    enabled: !!id,
  });
  useErrorToast(isError, lang, t('nav.parents', lang));

  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_parent')
        .select('id, relationship, student:students!student_parent_student_id_fkey(id, user:users!students_id_fkey(id, first_name, last_name, email, status))')
        .eq('parent_id', id!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const [linkOpen, setLinkOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentOpen, setStudentOpen] = useState(false);
  const debouncedStudentSearch = useDebounce(studentSearch, 300);
  const { data: studentResults } = useStudents(debouncedStudentSearch, 1, 10);

  const linkChildMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const { error } = await supabase.from('student_parent').insert({ parent_id: id!, student_id: studentId, relationship: 'parent' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast(t('success.updated', lang, t('nav.parents', lang)), 'success');
      qc.invalidateQueries({ queryKey: ['parent-children'] });
      setLinkOpen(false);
      setStudentSearch('');
      setSelectedStudent(null);
    },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const unlinkChildMutation = useMutation({
    mutationFn: async (linkId: number) => {
      const { error } = await supabase.from('student_parent').delete().eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast(t('success.deleted', lang, t('nav.parents', lang)), 'success');
      qc.invalidateQueries({ queryKey: ['parent-children'] });
    },
    onError: (err: Error) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);

  if (isLoading || childrenLoading) {
    return <div className="py-16 text-center text-muted-foreground">{t('common.loading', lang)}</div>;
  }
  if (!parent) {
    return <div className="py-16 text-center text-muted-foreground">{t('common.no_results', lang)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 rounded-full bg-primary/10">
          <AvatarFallback className="font-bold text-primary">{getInitials(parent.first_name, parent.last_name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{getFullName(parent.first_name, parent.last_name)}</h1>
          <p className="text-sm text-muted-foreground">{parent.email}</p>
        </div>
        <Badge variant={parent.status === 'active' ? 'success' : 'outline'} className={getStatusColor(parent.status)}>{parent.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">{t('common.contact', lang)}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {parent.email}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {parent.phone ?? '—'}</p>
            <p className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> {t('common.member_since', lang)} {formatDate(parent.created_at)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm">{t('nav.students', lang)} ({children.length})</CardTitle>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setLinkOpen(v => !v)}><UserPlus className="h-3.5 w-3.5" /> {t('common.link', lang)}</Button>
          </CardHeader>
          <CardContent>
            {linkOpen && (
              <div className="mb-4 space-y-2">
                <div className="relative">
                  <Input
                    placeholder={t('common.search', lang)}
                    value={studentSearch}
                    onChange={e => { setStudentSearch(e.target.value); setStudentOpen(true); }}
                    onFocus={() => setStudentOpen(true)}
                    onBlur={() => setTimeout(() => setStudentOpen(false), 150)}
                    className="h-9"
                  />
                  {studentOpen && (
                    <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border bg-background shadow-lg">
                      {studentResults?.data.length ? studentResults.data.map(s => (
                        <button
                          type="button"
                          key={s.id}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                          onMouseDown={() => {
                            setSelectedStudent({ id: s.id, name: `${s.firstName} ${s.lastName}`.trim() });
                            setStudentSearch('');
                            setStudentOpen(false);
                          }}
                        >
                          <span className="font-medium truncate">{`${s.firstName} ${s.lastName}`.trim()}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[40%]">{s.email}</span>
                        </button>
                      )) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">{t('common.no_results', lang)}</div>
                      )}
                    </div>
                  )}
                </div>
                {selectedStudent && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                    <span className="font-medium truncate">{selectedStudent.name}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="h-8" disabled={linkChildMutation.isPending} onClick={() => linkChildMutation.mutate(selectedStudent.id)}>{t('common.link', lang)}</Button>
                      <button onClick={() => setSelectedStudent(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {children.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t('common.no_results', lang)}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name', lang)}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('common.email', lang)}</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {children.map((c) => {
                    const st = c.student?.user ?? c.student;
                    if (!st?.id) return null;
                    return (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/assistant/students/${st.id}`)}>
                        <TableCell className="text-sm font-medium">{getFullName(st.first_name, st.last_name)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{st.email}</TableCell>
                        <TableCell>
                          <button
                            className="rounded p-1 text-muted-foreground hover:text-destructive"
                            title={t('common.unlink', lang)}
                            onClick={(e) => { e.stopPropagation(); unlinkChildMutation.mutate(c.id); }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}