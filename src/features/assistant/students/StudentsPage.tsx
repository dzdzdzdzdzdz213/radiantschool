import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { getInitials, formatDateTime } from '@/lib/utils';
import { useStudents, useCreateStudent } from './useStudents';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useToast } from '@/hooks/useToast';
import { useErrorToast } from '@/hooks/useErrorToast';

export default function StudentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useLang();
  const { toast } = useToast();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, isError } = useStudents(debouncedSearch, page, 20, statusFilter ? { status: statusFilter } : undefined);

  useErrorToast(isError, lang, t('nav.students', lang));

  const createStudent = useCreateStudent();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', status: 'active' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stripDigits = (v: string) => v.replace(/\d/g, '');

  const validate = () => {
    const e: Record<string, string> = {};
    const fn = form.firstName.trim();
    const ln = form.lastName.trim();
    if (!fn || fn.length < 2) e.firstName = t('errors.min_length', lang, '2');
    else if (/\d/.test(fn)) e.firstName = t('errors.letters_only', lang);
    if (!ln || ln.length < 2) e.lastName = t('errors.min_length', lang, '2');
    else if (/\d/.test(ln)) e.lastName = t('errors.letters_only', lang);
    if (!form.email.trim()) e.email = t('errors.required', lang);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t('errors.invalid_email', lang);
    if (form.phone && !/^(05|06|07|03)[0-9]{8}$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = t('errors.invalid_phone', lang);
    if (!form.password) e.password = t('validation.password_required', lang);
    else if (form.password.length < 8) e.password = t('validation.password_hint', lang);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreateModal = () => {
    setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', status: 'active' });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    createStudent.mutate(
      {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || null,
        password: form.password,
        status: form.status,
        role: 'student',
      },
      {
        onSuccess: () => {
          toast(t('success.created', lang, t('nav.students', lang)), 'success');
          setShowModal(false);
          setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', status: 'active' });
        },
        onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
      },
    );
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('students.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('common.first_name', lang)} <span className="text-red-500">*</span></Label>
                  <Input value={form.firstName} onInput={e => { const v = stripDigits((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = v; setForm(f => ({ ...f, firstName: v })); setErrors(e => ({ ...e, firstName: '' })); }} maxLength={50} />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{t('common.last_name', lang)} <span className="text-red-500">*</span></Label>
                  <Input value={form.lastName} onInput={e => { const v = stripDigits((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = v; setForm(f => ({ ...f, lastName: v })); setErrors(e => ({ ...e, lastName: '' })); }} maxLength={50} />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('common.email', lang)} <span className="text-red-500">*</span></Label>
                <Input type="email" value={form.email} onInput={e => { const v = (e.target as HTMLInputElement).value.replace(/\s/g, ''); (e.target as HTMLInputElement).value = v; setForm(f => ({ ...f, email: v })); setErrors(e => ({ ...e, email: '' })); }} maxLength={100} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('common.phone', lang)}</Label>
                <Input type="tel" value={form.phone} onInput={e => { const v = (e.target as HTMLInputElement).value.replace(/[^0-9\s-]/g, '').slice(0, 14); (e.target as HTMLInputElement).value = v; setForm(f => ({ ...f, phone: v })); setErrors(e => ({ ...e, phone: '' })); }} maxLength={14} placeholder="05XX-XX-XX-XX" />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('auth.password', lang)} <span className="text-red-500">*</span></Label>
                <Input type="password" value={form.password} onInput={e => { const v = (e.target as HTMLInputElement).value; (e.target as HTMLInputElement).value = v; setForm(f => ({ ...f, password: v })); setErrors(e => ({ ...e, password: '' })); }} maxLength={64} placeholder="Min. 8 caractères" />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('common.status', lang)}</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectItem value="active">{t('status.active', lang)}</SelectItem>
                  <SelectItem value="pending">{t('status.pending', lang)}</SelectItem>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={handleSave} disabled={createStudent.isPending}>
                  {createStudent.isPending ? t('common.loading', lang) : t('students.create', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.students', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('students.subtitle', lang)}</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('students.new', lang)}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search_student', lang)}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-9 pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {['active', 'pending', 'inactive', 'suspended'].map(s => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
                  className="h-8"
                >
                  {s === 'active' ? t('status.active', lang) : s === 'pending' ? t('status.pending', lang) : s === 'inactive' ? t('status.inactive', lang) : t('status.suspended', lang)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nav.students', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('common.email', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('common.phone', lang)}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('common.type', lang)}</TableHead>
                <TableHead className="text-right">{t('common.status', lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4, 5].map(c => (
                      <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t('common.no_results', lang)}
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((student) => (
                  <TableRow
                    key={student.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => navigate(`/assistant/students/${student.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(student.firstName, student.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{t('students.registered_on', lang)} {formatDateTime(student.createdAt)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{student.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{student.phone ?? '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{student.studentType ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={student.status === 'active' ? 'success' : student.status === 'pending' ? 'warning' : student.status === 'suspended' ? 'destructive' : 'outline'}>
                        {student.status === 'active' ? t('status.active', lang) : student.status === 'pending' ? t('status.pending', lang) : student.status === 'inactive' ? t('status.inactive', lang) : t('status.suspended', lang)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{t('common.total', lang)} : {data.meta.total}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('common.previous', lang)}</Button>
                <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>{t('common.next', lang)}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}