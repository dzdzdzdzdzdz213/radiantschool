import { useState, useRef } from 'react';
import { Upload, FileText, Search, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { convertToWebP } from '@/lib/storage';
import { formatDateTime } from '@/lib/utils';
import { useDownloadFile } from '@/hooks/useMutationFeedback';
import { useToast } from '@/hooks/useToast';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuth } from '@/hooks/useAuth';
import ConfirmDialog from '@/components/ui/confirm-dialog';

export default function ResourcesPage() {
  const { lang } = useLang();
  const { profile } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const downloadFile = useDownloadFile();

  const { data: resources, isLoading, isError } = useQuery({
    queryKey: ['assistant_resources', search],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select('id, title, file_url, type, created_at')
        .order('created_at', { ascending: false });
      if (search) query = query.ilike('title', `%${search}%`);
      const { data } = await query;
      return data ?? [];
    },
  });

  useErrorToast(isError, lang, t('nav.resources', lang));

  const ALLOWED_TYPES = ['application/pdf','image/jpeg','image/png','image/webp','image/gif','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','text/plain','text/csv','application/zip','application/x-rar-compressed','application/x-7z-compressed'];

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(t('errors.mime_not_supported', lang, file.type));
      }
      let uploadFile = file;
      let filePath = `assistant-resources/${Date.now()}_${file.name}`;
      const isImage = file.type.startsWith('image/') && file.type !== 'image/gif';
      if (isImage) {
        try {
          const webpBlob = await convertToWebP(file, 1200);
          uploadFile = new File([webpBlob], `${Date.now()}.webp`, { type: 'image/webp' });
          filePath = `assistant-resources/${Date.now()}.webp`;
        } catch { /* keep original file */ }
      }
      const { error: uploadError } = await supabase.storage.from('resources').upload(filePath, uploadFile, { contentType: uploadFile.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('resources').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('resources').insert({
        title: isImage ? `${file.name.replace(/\.[^.]+$/, '')}.webp` : file.name,
        type: isImage ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('application/pdf') ? 'pdf' : file.type.startsWith('image/') ? 'image' : 'link',
        file_url: urlData.publicUrl,
        course_id: 0,
        uploaded_by: profile?.id ?? '',
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_resources'] }); toast(t('success.created', lang, t('resources.file', lang)), 'success'); },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_resources'] }); toast(t('success.deleted', lang, t('resources.resource', lang)), 'success'); },
    onError: (err) => toast(err?.message ?? t('common.error', lang), 'error'),
  });

  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id, { onSettled: () => setConfirmDelete(null) }); }}
        message={`${t('common.confirm_delete', lang)} "${confirmDelete?.name ?? ''}" ?`}
        loading={deleteMutation.isPending}
      />
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z" onChange={(e) => { if (e.target.files?.[0]) { uploadMutation.mutate(e.target.files[0]); e.target.value = ''; } }} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.resources', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('resources.subtitle', lang)}</p>
        </div>
        <Button className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}><Upload className="h-4 w-4" />{uploadMutation.isPending ? t('common.loading', lang) : t('common.upload', lang)}</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('common.search', lang)} value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('common.type', lang)}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('common.date', lang)}</TableHead>
                <TableHead className="text-right">{t('common.actions', lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
              )) : (resources ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('common.no_data', lang)}</TableCell></TableRow>
              ) : (
                (resources ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{r.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline">{r.type ?? '—'}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDateTime(r.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => downloadFile.mutate({ fileUrl: r.file_url ?? '', filename: r.title })} disabled={downloadFile.isPending}><Download className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setConfirmDelete({ id: r.id, name: r.title })} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
