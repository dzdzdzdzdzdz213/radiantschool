import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses, useSubjects, useLevels, useRooms } from '@/hooks/useQueries';
import { useUsers } from '@/hooks/useQueries';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, getStatusColor, getFullName } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Search, Plus, BookOpen, X, Pencil, Trash2, Filter, Camera, Loader, ImageOff, Trash } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseImageUrl, uploadCourseImage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function CoursesPage() {
  const { data: courses, isLoading, isError } = useCourses();
  const { data: subjects } = useSubjects();
  const { data: levels } = useLevels();
  const { data: rooms } = useRooms();
  const { data: allUsers } = useUsers();
  const { lang } = useLang();
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const levelsByCat = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    for (const l of levels ?? []) {
      (grouped[l.category] ??= []).push(l);
    }
    return grouped;
  }, [levels]);

  const filteredLevels = catFilter ? (levelsByCat[catFilter] ?? []) : (levels ?? []);

  const teachers = allUsers?.filter((u: any) => u.role === 'teacher') ?? [];

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', type: 'normal', price: '', capacity: '', start_date: '', end_date: '', subject_id: '', level_id: '', teacher_id: '', room_id: '', description: '', image_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', type: 'normal', price: '', capacity: '', start_date: '', end_date: '', subject_id: '', level_id: '', teacher_id: '', room_id: '', description: '', image_url: '' });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({
      name: item.name ?? '',
      type: item.type ?? 'normal',
      price: item.price?.toString() ?? '',
      capacity: item.capacity?.toString() ?? '',
      start_date: item.start_date ?? '',
      end_date: item.end_date ?? '',
      subject_id: item.subject_id?.toString() ?? '',
      level_id: item.level_id?.toString() ?? '',
      teacher_id: item.teacher_id ?? '',
      room_id: item.room_id?.toString() ?? '',
      description: item.description ?? '',
      image_url: item.image_url ?? '',
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let image_url = form.image_url || null;
      if (imageFile) {
        const tempId = editingId ?? -Date.now();
        image_url = await uploadCourseImage(tempId, imageFile);
      }
      const base = {
        name: form.name.trim(),
        type: form.type as "normal" | "vip" | "private",
        price: form.price ? parseFloat(form.price) : 0,
        capacity: form.capacity ? parseInt(form.capacity, 10) : 1,
        start_date: form.start_date,
        end_date: form.end_date,
        description: form.description.trim() || undefined,
        image_url,
        room_id: form.room_id ? parseInt(form.room_id, 10) : undefined,
      };
      if (editingId) {
        const { error } = await supabase.from('courses').update({
          ...base,
          subject_id: form.subject_id ? parseInt(form.subject_id, 10) : undefined,
          level_id: form.level_id ? parseInt(form.level_id, 10) : undefined,
          teacher_id: form.teacher_id || undefined,
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: inserted } = await supabase.from('courses').insert({
          ...base,
          subject_id: parseInt(form.subject_id, 10),
          level_id: parseInt(form.level_id, 10),
          teacher_id: form.teacher_id,
        }).select('id').single();
        if (inserted && imageFile) {
          const newPath = await uploadCourseImage(inserted.id, imageFile);
          await supabase.from('courses').update({ image_url: newPath }).eq('id', inserted.id);
        }
        if (!inserted) throw new Error('Creation failed');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'], refetchType: 'all' });
      toast(t(editingId ? 'success.updated' : 'success.created', lang, t('nav.courses', lang)), 'success');
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', type: 'normal', price: '', capacity: '', start_date: '', end_date: '', subject_id: '', level_id: '', teacher_id: '', room_id: '', description: '', image_url: '' });
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast(t('success.deleted', lang, t('nav.courses', lang)), 'success');
    },
    onError: (err: any) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  const filtered = (courses ?? []).filter((c: any) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.subject?.name?.toLowerCase().includes(q) || c.level?.name?.toLowerCase().includes(q) || c.level?.stream?.toLowerCase().includes(q);
    const matchesType = !typeFilter || c.type === typeFilter;
    const matchesCat = !catFilter || c.level?.category === catFilter;
    const matchesLevel = !levelFilter || c.level_id === parseInt(levelFilter);
    const matchesSubject = !subjectFilter || c.subject_id === parseInt(subjectFilter);
    return matchesSearch && matchesType && matchesCat && matchesLevel && matchesSubject;
  });

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.courses', lang)}</h1>
        <Button className="h-9 gap-2" onClick={openCreateModal} disabled={saveMutation.isPending}><Plus className="h-4 w-4" />{t('common.add', lang)}</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 bg-black/50" onClick={() => setShowModal(false)}>
          <Card className="bg-card rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4 shadow-xl my-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingId ? t('common.edit', lang) : t('common.add', lang)}</h2>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.name', lang)} *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.description', lang)}</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-9" rows={2} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Image du cours</Label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview || form.image_url ? (
                      <img src={imagePreview || getCourseImageUrl(form.image_url) || ''} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff className="h-6 w-6 text-muted-foreground" />
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button type="button" variant="outline" size="sm" className="h-8 gap-2" onClick={() => document.getElementById('course-image-input')?.click()}>
                      <Camera className="h-4 w-4" />{form.image_url ? t('common.change', lang) : t('common.add', lang)}
                    </Button>
                    {(imagePreview || form.image_url) && (
                      <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 text-destructive" onClick={() => { setImageFile(null); setImagePreview(null); setForm(f => ({ ...f, image_url: '' })); }}>
                        <Trash className="h-4 w-4" />{t('common.delete', lang)}
                      </Button>
                    )}
                    <input id="course-image-input" type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                    }} />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.type', lang)} *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))} placeholder={t('common.select', lang)}>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="private">Particulier</SelectItem>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.price', lang)}</Label>
                  <Input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('groups.capacity', lang)}</Label>
                  <Input type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.start', lang)}</Label>
                  <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">{t('common.end', lang)}</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="h-9" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.subject', lang)} *</Label>
                <Select value={form.subject_id} onValueChange={v => setForm(f => ({ ...f, subject_id: v }))} placeholder={t('common.select', lang)}>
                  {(subjects ?? []).map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.level', lang)} *</Label>
                <Select value={form.level_id} onValueChange={v => setForm(f => ({ ...f, level_id: v }))} placeholder={t('common.select', lang)}>
                  {(levels ?? [])
                    .sort((a: any, b: any) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
                    .map((l: any) => {
                      const catLabel = l.category === 'primary' ? 'Primaire' : l.category === 'middle' ? 'CEM' : 'Lycée';
                      return (
                        <SelectItem key={l.id} value={String(l.id)}>
                          [{catLabel}] {l.name}{l.stream ? ` - ${l.stream}` : ''}
                        </SelectItem>
                      );
                    })}
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.room', lang)}</Label>
                <Select value={form.room_id} onValueChange={v => setForm(f => ({ ...f, room_id: v }))} placeholder={t('common.select', lang)}>
                  <SelectItem value="">—</SelectItem>
                  {(rooms ?? []).map((r: any) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">{t('common.teacher', lang)} *</Label>
                <Select value={form.teacher_id} onValueChange={v => setForm(f => ({ ...f, teacher_id: v }))} placeholder={t('common.select', lang)}>
                  {teachers.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{getFullName(t.first_name, t.last_name)}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowModal(false)}>{t('common.cancel', lang)}</Button>
              <Button size="sm" className="h-9" disabled={!form.name || !form.subject_id || !form.level_id || !form.teacher_id || saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? t('common.loading', lang) : (editingId ? t('common.save', lang) : t('common.create', lang))}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {t('errors.load_error', lang, t('nav.courses', lang))}. {t('dashboard.load_error_retry', lang)}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search_course', lang)} className="h-10 pl-10" />
        </div>
        <Select value={catFilter} onValueChange={v => { setCatFilter(v); setLevelFilter(''); }} placeholder={t('common.all', lang)}>
          <SelectItem value="">{t('common.all', lang)}</SelectItem>
          <SelectItem value="primary">{t('enroll.category_primaire', lang)}</SelectItem>
          <SelectItem value="middle">{t('enroll.category_cem', lang)}</SelectItem>
          <SelectItem value="high_school">{t('enroll.category_lycee', lang)}</SelectItem>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter} placeholder={t('common.all', lang)}>
          <SelectItem value="">{t('common.all', lang)}</SelectItem>
          {filteredLevels.map((l: any) => (
            <SelectItem key={l.id} value={String(l.id)}>{l.name}{l.stream ? ` - ${l.stream}` : ''}</SelectItem>
          ))}
        </Select>
        <Select value={subjectFilter} onValueChange={setSubjectFilter} placeholder={t('common.all', lang)}>
          <SelectItem value="">{t('common.all', lang)}</SelectItem>
          {(subjects ?? []).map((s: any) => (
            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
          ))}
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter} placeholder={t('common.all', lang)}>
          <SelectItem value="">{t('common.all', lang)}</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="vip">{t('type.vip', lang)}</SelectItem>
          <SelectItem value="private">{t('type.private', lang)}</SelectItem>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>
        ) : isError ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">{t('errors.load_error', lang, t('nav.courses', lang))}</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">{t('common.no_results', lang)}</div>
        ) : (
          filtered.map((c: any) => (
            <div key={c.id} className="rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md overflow-hidden">
              {c.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img src={getCourseImageUrl(c.image_url) || ''} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`./${c.id}`)}>
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditModal(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setConfirmDelete({ id: c.id, name: c.name })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="text-foreground">{t('common.teacher', lang)}:</span> {c.teacher ? getFullName(c.teacher.first_name, c.teacher.last_name) : t('common.not_assigned', lang)}</p>
                <p><span className="text-foreground">{t('common.level', lang)}:</span> {c.level?.name}{c.level?.stream ? ` - ${c.level.stream}` : ''}</p>
                <p><span className="text-foreground">{t('groups.capacity', lang)}:</span> {c.current_enrollments}/{c.capacity}</p>
                <p>{t('common.price', lang)}: {formatCurrency(c.price)}</p>
                <p>{t('common.from', lang)} {formatDate(c.start_date)} {t('common.to', lang)} {formatDate(c.end_date)}</p>
              </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
