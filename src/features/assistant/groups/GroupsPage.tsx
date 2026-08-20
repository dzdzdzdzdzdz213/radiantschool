import { useState, useMemo, useEffect } from 'react';
import { Plus, Users, X, Pencil, Trash2, Search, Calendar, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t, type Lang } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useSubjects, useLevels, useRooms, useUsers } from '@/hooks/useQueries';
import { getFullName } from '@/lib/utils';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useSearchParams } from 'react-router-dom';

const DAY_LABELS: Record<string, Record<string, string>> = {
  fr: { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mer', thursday: 'Jeu', friday: 'Ven', saturday: 'Sam', sunday: 'Dim' },
  en: { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' },
  ar: { monday: 'اثنين', tuesday: 'ثلاثاء', wednesday: 'اربعاء', thursday: 'خميس', friday: 'جمعة', saturday: 'سبت', sunday: 'احد' },
};

function CapacityBar({ current, capacity }: { current: number; capacity: number }) {
  const pct = Math.min((current / (capacity || 1)) * 100, 100);
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-emerald-500';
  return (
    <div className="mt-2 h-1.5 rounded-full bg-accent overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusBadge({ status, lang }: { status: string; lang: string }) {
  const variant: BadgeProps['variant'] = status === 'active' ? 'success' : status === 'full' ? 'warning' : status === 'cancelled' ? 'destructive' : 'outline';
  const key = `status.${status}`;
  const label = t(key, lang as Lang) || status;
  return <Badge variant={variant}>{label}</Badge>;
}

type ScheduleChip = { id: number; day_of_week: Database['public']['Enums']['day_of_week']; start_time: string; end_time: string };

function ScheduleChips({ schedules, lang }: { schedules: ScheduleChip[] | null | undefined; lang: string }) {
  if (!schedules?.length) return null;
  const langKey = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en';
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {schedules.map((s) => (
        <span key={s.id} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          <Clock className="h-2.5 w-2.5" />
          {DAY_LABELS[langKey]?.[s.day_of_week] ?? s.day_of_week} {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
        </span>
      ))}
    </div>
  );
}

export default function GroupsPage() {
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('groups_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      })
      .subscribe();
    return () => { channel.unsubscribe(); supabase.removeChannel(channel); };
  }, [qc]);

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ['assistant_groups'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, name, type, capacity, current_enrollments, status, description, price, start_date, end_date, level_id, subject_id, room:rooms(id, name), level:levels(name, category), subject:subjects(name), teacher:users!teacher_id(id, first_name, last_name), schedules:course_schedules(id, day_of_week, start_time, end_time)')
        .order('name');
      return data ?? [];
    },
  });

  const { data: subjects } = useSubjects();
  const { data: levels } = useLevels();
  const { data: rooms } = useRooms();
  const { data: allUsers } = useUsers();
  const teachers = (allUsers ?? []).filter((u) => u.role === 'teacher');

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [catFilter, setCatFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'enrollment' | 'capacity'>('name');

  const levelsByCat = useMemo(() => {
    const grouped: Record<string, NonNullable<typeof levels>[number][]> = {};
    for (const l of levels ?? []) {
      (grouped[l.category] ??= []).push(l);
    }
    return grouped;
  }, [levels]);
  const filteredLevels = catFilter !== 'all' ? (levelsByCat[catFilter] ?? []) : (levels ?? []);

  const filteredGroups = useMemo(() => {
    const result = (groups ?? []).filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.subject?.name?.toLowerCase().includes(q) || c.level?.name?.toLowerCase().includes(q) || c.teacher ? getFullName(c.teacher?.first_name, c.teacher?.last_name).toLowerCase().includes(q) : false;
      const matchesCat = catFilter === 'all' || c.level?.category === catFilter;
      const matchesLevel = levelFilter === 'all' || c.level_id === parseInt(levelFilter);
      const matchesSubject = subjectFilter === 'all' || c.subject_id === parseInt(subjectFilter);
      return matchesSearch && matchesCat && matchesLevel && matchesSubject;
    });
    result.sort((a, b) => {
      if (sortBy === 'enrollment') return (b.current_enrollments ?? 0) - (a.current_enrollments ?? 0);
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      return a.name.localeCompare(b.name);
    });
    return result;
  }, [groups, search, catFilter, levelFilter, subjectFilter, sortBy]);

  useErrorToast(isError, lang, t('nav.groups', lang));

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', type: 'normal', description: '', price: '', capacity: '', start_date: '', end_date: '', subject_id: '', level_id: '', teacher_id: '', room_id: '' });
  const [schedules, setSchedules] = useState<{ day_of_week: string; start_time: string; end_time: string }[]>([]);

  const EMPTY_FORM = { name: '', type: 'normal', description: '', price: '', capacity: '', start_date: '', end_date: '', subject_id: '', level_id: '', teacher_id: '', room_id: '' };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSchedules([]);
    setShowModal(true);
  };

  const openEditModal = (item: NonNullable<typeof groups>[number]) => {
    setEditingId(item.id);
    setForm({ name: item.name ?? '', type: item.type ?? 'normal', description: item.description ?? '', price: item.price?.toString() ?? '', capacity: item.capacity?.toString() ?? '', start_date: item.start_date ?? '', end_date: item.end_date ?? '', subject_id: item.subject_id?.toString() ?? '', level_id: item.level_id?.toString() ?? '', teacher_id: item.teacher?.id ?? '', room_id: item.room?.id?.toString() ?? '' });
    setSchedules((item.schedules ?? []).map((s) => ({ day_of_week: s.day_of_week, start_time: s.start_time?.slice(0, 5), end_time: s.end_time?.slice(0, 5) })));
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error(t('groups.name_required', lang));
      if (!form.level_id) throw new Error(t('groups.level_required', lang));
      if (!form.subject_id) throw new Error(t('groups.subject_required', lang));
      if (!form.teacher_id) throw new Error(t('groups.teacher_required', lang));
      if (!form.start_date) throw new Error(t('groups.start_date_required', lang));
      if (!form.end_date) throw new Error(t('groups.end_date_required', lang));
      if (schedules.length === 0) throw new Error(t('groups.schedule_required', lang));
      if (form.end_date < form.start_date) throw new Error(t('groups.date_range_invalid', lang));
      for (const s of schedules) {
        if (s.end_time <= s.start_time) throw new Error(t('groups.time_range_invalid', lang));
      }
      const price = parseFloat(form.price);
      if (isNaN(price) || price <= 0) throw new Error(t('groups.price_invalid', lang));
      const capacity = parseInt(form.capacity, 10);
      if (isNaN(capacity) || capacity <= 0) throw new Error(t('groups.capacity_invalid', lang));
      const payload: Database['public']['Tables']['courses']['Insert'] = {
        name: form.name.trim(),
        description: form.description.trim(),
        capacity,
        price,
        start_date: form.start_date,
        end_date: form.end_date,
        type: form.type as Database['public']['Enums']['course_type'],
        subject_id: parseInt(form.subject_id, 10),
        level_id: parseInt(form.level_id, 10),
        teacher_id: form.teacher_id,
        room_id: form.room_id ? parseInt(form.room_id, 10) : null,
      };
      if (!editingId) payload.status = 'active';
      const scheduleRows = schedules.map((s) => ({
        day_of_week: s.day_of_week as Database['public']['Enums']['day_of_week'],
        start_time: s.start_time,
        end_time: s.end_time,
      }));
      let courseId: number;
      if (editingId) {
        const { error } = await supabase.from('courses').update(payload).eq('id', editingId);
        if (error) throw error;
        courseId = editingId;
      } else {
        const { data, error } = await supabase.from('courses').insert(payload).select('id').single();
        if (error) throw error;
        courseId = data.id;
      }
      const { error: schedError } = await supabase.rpc('replace_course_schedules', {
        p_course_id: courseId,
        p_schedules: scheduleRows.map((s) => ({ ...s, teacher_id: form.teacher_id, room_id: form.room_id ? parseInt(form.room_id, 10) : null })),
      });
      if (schedError) throw schedError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, t('nav.groups', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setSchedules([]);
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      toast(t('success.deleted', lang, t('nav.groups', lang)), 'success');
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { error } = await supabase.from('courses').update({ status: status as never }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      toast(t('success.updated', lang, t('groups.status', lang)), 'success');
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  // Student roster state
  const [rosterGroupId, setRosterGroupId] = useState<number | null>(null);
  const [confirmRemoveEnrollment, setConfirmRemoveEnrollment] = useState<{ id: number; name: string } | null>(null);
  const { data: rosterStudents, isLoading: rosterLoading } = useQuery({
    queryKey: ['group_roster', rosterGroupId],
    queryFn: async () => {
      if (!rosterGroupId) return [];
      const { data } = await supabase
        .from('course_enrollments')
        .select('id, enrollment_date, status, student:students!student_id(user:users!students_id_fkey(id, first_name, last_name, email))')
        .eq('course_id', rosterGroupId)
        .order('enrollment_date', { ascending: false });
      return data ?? [];
    },
    enabled: !!rosterGroupId,
  });

  const removeEnrollmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('course_enrollments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group_roster', rosterGroupId] });
      qc.invalidateQueries({ queryKey: ['assistant_groups'] });
      qc.invalidateQueries({ queryKey: ['student-courses'] });
      toast(t('success.deleted', lang, t('groups.students', lang)), 'success');
    },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={!!confirmRemoveEnrollment}
        onClose={() => setConfirmRemoveEnrollment(null)}
        onConfirm={() => { if (confirmRemoveEnrollment) removeEnrollmentMutation.mutate(confirmRemoveEnrollment.id, { onSettled: () => setConfirmRemoveEnrollment(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmRemoveEnrollment?.name ?? ''}" ?`}
        loading={removeEnrollmentMutation.isPending}
      />

      {/* Student Roster Modal */}
      {rosterGroupId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setRosterGroupId(null)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('groups.students', lang)}
              </CardTitle>
              <button onClick={() => setRosterGroupId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent>
              {rosterLoading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>
              ) : rosterStudents?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">{t('groups.no_students', lang)}</p>
              ) : (
                <div className="space-y-1">
                  {rosterStudents?.map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{e.student ? getFullName(e.student.user?.first_name, e.student.user?.last_name) : '—'}</p>
                        <p className="text-xs text-muted-foreground">{e.student?.user?.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={e.status === 'active' ? 'success' : 'outline'} className="text-[10px]">{e.status}</Badge>
                        <span className="text-[10px] text-muted-foreground">{e.enrollment_date ? new Date(e.enrollment_date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US') : ''}</span>
                        <Button
                          variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                          onClick={() => setConfirmRemoveEnrollment({ id: e.id, name: e.student?.user ? getFullName(e.student.user.first_name, e.student.user.last_name) : 'élève' })}
                          disabled={removeEnrollmentMutation.isPending}
                          title={t('common.remove', lang)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.groups', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('groups.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('groups.new', lang)}</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('groups.search_placeholder', lang)} className="h-9 pl-9" />
        </div>
        <Select value={catFilter} onValueChange={v => { setCatFilter(v); setLevelFilter('all'); }} className="min-w-[130px]">
          <SelectItem value="all">{t('groups.all_levels', lang)}</SelectItem>
          <SelectItem value="primary">{t('landing.category_primaire', lang)}</SelectItem>
          <SelectItem value="middle">{t('landing.category_cem', lang)}</SelectItem>
          <SelectItem value="high_school">{t('landing.category_lycee', lang)}</SelectItem>
        </Select>
        <Select value={levelFilter} onValueChange={v => setLevelFilter(v)} className="min-w-[140px]">
          <SelectItem value="all">{t('groups.all_classes', lang)}</SelectItem>
          {filteredLevels.map((l) => (
            <SelectItem key={l.id} value={String(l.id)}>{l.name}{l.stream ? ` - ${l.stream}` : ''}</SelectItem>
          ))}
        </Select>
        <Select value={subjectFilter} onValueChange={v => setSubjectFilter(v)} className="min-w-[130px]">
          <SelectItem value="all">{t('groups.all_subjects', lang)}</SelectItem>
          {(subjects ?? []).map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
          ))}
        </Select>
        <Select value={sortBy} onValueChange={v => setSortBy(v as 'name' | 'enrollment' | 'capacity')} className="min-w-[130px]">
          <SelectItem value="name">{t('common.name', lang)}</SelectItem>
          <SelectItem value="enrollment">{t('groups.enrolled', lang)}</SelectItem>
          <SelectItem value="capacity">{t('groups.capacity', lang)}</SelectItem>
        </Select>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4 my-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{editingId ? t('common.edit', lang) : t('groups.new', lang)}</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name', lang)} *</Label>
                <Input placeholder={t('common.name', lang)} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.type', lang)} *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))} placeholder={t('common.select', lang)}>
                  <SelectItem value="normal">{t('type.normal', lang)}</SelectItem>
                  <SelectItem value="vip">{t('type.vip', lang)}</SelectItem>
                  <SelectItem value="private">{t('type.private', lang)}</SelectItem>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', lang)}</Label>
                <Textarea placeholder={t('groups.desc_placeholder', lang)} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.price', lang)} *</Label>
                <Input type="number" min="0" placeholder="5000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('groups.capacity', lang)} *</Label>
                <Input type="number" placeholder={t('groups.capacity_placeholder', lang)} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('common.start', lang)} *</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.end', lang)} *</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('common.level', lang)} *</Label>
                <Select value={form.level_id} onValueChange={v => setForm(f => ({ ...f, level_id: v }))} placeholder={t('common.select', lang)}>
                  {(levels ?? [])
                    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
                    .map((l) => {
                      const catLabel = l.category === 'primary' ? t('landing.category_primaire', lang) : l.category === 'middle' ? t('landing.category_cem', lang) : t('landing.category_lycee', lang);
                      return (
                        <SelectItem key={l.id} value={String(l.id)}>
                          [{catLabel}] {l.name}{l.stream ? ` - ${l.stream}` : ''}
                        </SelectItem>
                      );
                    })}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.subject', lang)} *</Label>
                <Select value={form.subject_id} onValueChange={v => setForm(f => ({ ...f, subject_id: v }))} placeholder={t('common.select', lang)}>
                  {(subjects ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.teacher', lang)} *</Label>
                <Select value={form.teacher_id} onValueChange={v => setForm(f => ({ ...f, teacher_id: v }))} placeholder={t('common.select', lang)}>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{getFullName(t.first_name, t.last_name)}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.room', lang)}</Label>
                <Select value={form.room_id} onValueChange={v => setForm(f => ({ ...f, room_id: v }))} placeholder={t('common.select', lang)}>
                  <SelectItem value="">—</SelectItem>
                  {(rooms ?? []).map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('nav.schedule', lang)} *</Label>
                {schedules.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Select value={s.day_of_week} onValueChange={v => setSchedules(prev => prev.map((p, j) => j === i ? { ...p, day_of_week: v } : p))} className="min-w-[110px]">
                      {Object.keys(DAY_LABELS.fr).map((d) => (
                        <SelectItem key={d} value={d}>{DAY_LABELS[lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en'][d]}</SelectItem>
                      ))}
                    </Select>
                    <Input type="time" className="w-28" value={s.start_time} onChange={e => setSchedules(prev => prev.map((p, j) => j === i ? { ...p, start_time: e.target.value } : p))} />
                    <Input type="time" className="w-28" value={s.end_time} onChange={e => setSchedules(prev => prev.map((p, j) => j === i ? { ...p, end_time: e.target.value } : p))} />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setSchedules(prev => prev.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setSchedules(prev => [...prev, { day_of_week: 'monday', start_time: '09:00', end_time: '10:00' }])}>
                  <Plus className="h-3.5 w-3.5" />
                  {t('groups.add_schedule', lang)}
                </Button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('groups.create', lang))}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : filteredGroups.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>{t('common.no_data', lang)}</p>
          </div>
        ) : filteredGroups.map((g) => (
          <Card key={g.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base truncate">{g.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.level?.name ?? '—'} · {g.subject?.name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{g.teacher ? getFullName(g.teacher.first_name, g.teacher.last_name) : '—'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <StatusBadge status={g.status} lang={lang} />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(g)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: g.id, name: g.name })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{g.current_enrollments ?? 0}/{g.capacity} {t('groups.enrolled', lang)}</span>
                </div>
                <Badge variant="outline" className="text-[10px]">{t(`type.${g.type}`, lang) || g.type}</Badge>
              </div>
              <CapacityBar current={g.current_enrollments ?? 0} capacity={g.capacity} />

              {/* Room */}
              {g.room && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{g.room.name}</span>
                </div>
              )}

              {/* Dates */}
              {g.start_date && g.end_date && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(`${g.start_date}T00:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })} – {new Date(`${g.end_date}T00:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}

              {/* Schedule */}
              <ScheduleChips schedules={g.schedules} lang={lang} />

              {/* Actions row */}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setRosterGroupId(g.id)}>
                  <Users className="h-3 w-3" />
                  {t('groups.view_students', lang)}
                </Button>
                <Select value={g.status} onValueChange={v => statusMutation.mutate({ id: g.id, status: v })} className="h-7 text-xs">
                  <SelectItem value="active">{t('status.active', lang)}</SelectItem>
                  <SelectItem value="inactive">{t('status.inactive', lang)}</SelectItem>
                  <SelectItem value="full">{t('status.full', lang)}</SelectItem>
                  <SelectItem value="cancelled">{t('status.cancelled', lang)}</SelectItem>
                  <SelectItem value="pending">{t('status.pending', lang)}</SelectItem>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
