import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, BookOpen, LayoutDashboard, Settings, CreditCard, Calendar, FileText, UserCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

const roleRoutes: Record<string, { icon: React.ReactNode; label: string; path: string }[]> = {
  admin: [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Users className="h-4 w-4" />, label: 'Utilisateurs', path: '/admin/users' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Cours', path: '/admin/courses' },
    { icon: <Calendar className="h-4 w-4" />, label: 'Emploi du temps', path: '/admin/schedule' },
    { icon: <FileText className="h-4 w-4" />, label: 'Factures', path: '/admin/invoices' },
    { icon: <FileText className="h-4 w-4" />, label: 'Paie', path: '/admin/payroll' },
    { icon: <FileText className="h-4 w-4" />, label: 'Audit', path: '/admin/audit-log' },
    { icon: <Settings className="h-4 w-4" />, label: 'Paramètres', path: '/admin/settings' },
  ],
  assistant: [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/assistant/dashboard' },
    { icon: <Users className="h-4 w-4" />, label: 'Élèves', path: '/assistant/students' },
    { icon: <Users className="h-4 w-4" />, label: 'Parents', path: '/assistant/parents' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Cours', path: '/assistant/groups' },
    { icon: <Calendar className="h-4 w-4" />, label: 'Présences', path: '/assistant/attendance' },
    { icon: <Search className="h-4 w-4" />, label: 'Recherche', path: '/assistant/search' },
    { icon: <Settings className="h-4 w-4" />, label: 'Paramètres', path: '/assistant/settings' },
  ],
  teacher: [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Mes cours', path: '/teacher/courses' },
    { icon: <Calendar className="h-4 w-4" />, label: 'Emploi du temps', path: '/teacher/schedule' },
    { icon: <Users className="h-4 w-4" />, label: 'Élèves', path: '/teacher/students' },
    { icon: <Settings className="h-4 w-4" />, label: 'Paramètres', path: '/teacher/profile' },
  ],
  student: [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/student/dashboard' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Mes cours', path: '/student/courses' },
    { icon: <Calendar className="h-4 w-4" />, label: 'Emploi du temps', path: '/student/schedule' },
    { icon: <UserCircle className="h-4 w-4" />, label: 'Profil', path: '/student/profile' },
  ],
  parent: [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: 'Dashboard', path: '/parent/dashboard' },
    { icon: <GraduationCap className="h-4 w-4" />, label: 'Inscription', path: '/parent/enroll' },
    { icon: <CreditCard className="h-4 w-4" />, label: 'Paiements', path: '/parent/payments' },
    { icon: <Settings className="h-4 w-4" />, label: 'Profil', path: '/parent/profile' },
  ],
};

export default function CmdK() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const role = profile?.role || '';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const fetchSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setStudents([]); setCourses([]); return; }
    const [studRes, courseRes] = await Promise.all([
      supabase.from('users').select('id, first_name, last_name').ilike('first_name', `%${q}%`).or(`last_name.ilike.%${q}%`).limit(5),
      supabase.from('courses').select('id, name').ilike('name', `%${q}%`).limit(5),
    ]);
    setStudents((studRes.data || []).map((s) => ({ id: s.id, name: `${s.first_name} ${s.last_name}` })));
    setCourses((courseRes.data || []).map((c) => ({ id: c.id, name: c.name })));
  }, []);

  const run = (path: string) => {
    setOpen(false);
    setSearch('');
    navigate(path);
  };

  const routes = roleRoutes[role] || [];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Rechercher..."
        value={search}
        onValueChange={(v) => { setSearch(v); fetchSearch(v); }}
      />
      <CommandList>
        <CommandEmpty>Aucun résultat</CommandEmpty>
        {routes.length > 0 && (
          <CommandGroup heading="Navigation">
            {routes.map((r) => (
              <CommandItem key={r.path} onSelect={() => run(r.path)}>
                {r.icon}
                {r.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {students.length > 0 && (
          <CommandGroup heading="Élèves">
            {students.map((s) => (
              <CommandItem key={s.id} onSelect={() => run(`/assistant/students/${s.id}`)}>
                <UserCircle className="h-4 w-4" />
                {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {courses.length > 0 && (
          <CommandGroup heading="Cours">
            {courses.map((c) => (
              <CommandItem key={c.id} onSelect={() => run(`/assistant/groups/${c.id}`)}>
                <BookOpen className="h-4 w-4" />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
