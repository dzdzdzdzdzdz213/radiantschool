import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { getInitials } from '@/lib/utils';

export default function TeacherStudentsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: students, isLoading } = useQuery({
    queryKey: ['teacher_students', profile?.id, debouncedSearch],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from('course_enrollments')
        .select('student:users!student_id(id, first_name, last_name, email, phone, status, photo_url), course:courses!inner(id, name, teacher_id)')
        .eq('course.teacher_id', profile.id)
        .eq('status', 'active');
      const unique = new Map();
      for (const r of data ?? []) {
        if (r.student && !unique.has(r.student.id)) {
          const name = `${r.student.first_name ?? ''} ${r.student.last_name ?? ''}`;
          if (!debouncedSearch || name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
            unique.set(r.student.id, r.student);
          }
        }
      }
      return Array.from(unique.values());
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">Mes élèves</h1><p className="text-sm text-muted-foreground mt-1">Consulter les profils et informations de vos élèves</p></div>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un élève..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (<TableRow key={i}>{[1, 2, 3, 4].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>))
              : (students ?? []).length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucun élève trouvé</TableCell></TableRow>
              : (students ?? []).map((s: any) => (
                <TableRow key={s.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/teacher/students/${s.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(s.first_name ?? '', s.last_name ?? '')}</AvatarFallback></Avatar>
                      <p className="text-sm font-medium">{s.first_name} {s.last_name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{s.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{s.phone ?? '—'}</TableCell>
                  <TableCell className="text-right"><Badge variant={s.status === 'active' ? 'success' : 'outline'}>{s.status === 'active' ? 'Actif' : 'Inactif'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}