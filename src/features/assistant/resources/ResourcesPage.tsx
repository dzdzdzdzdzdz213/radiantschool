import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Search, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils';
import { useDownloadFile } from '@/hooks/useMutationFeedback';
import { useToast } from '@/components/ui/Toast';

export default function ResourcesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const downloadFile = useDownloadFile();

  const { data: resources, isLoading, isError } = useQuery({
    queryKey: ['assistant_resources', search],
    queryFn: async () => {
      let query = (supabase as any)
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      if (search) query = query.ilike('name', `%${search}%`);
      const { data } = await query;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (isError) toast('Erreur lors du chargement des ressources', 'error');
  }, [isError]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const filePath = `assistant-resources/${Date.now()}_${file.name}`;
      const { error: uploadError } = await (supabase as any).storage.from('resources').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = (supabase as any).storage.from('resources').getPublicUrl(filePath);
      const { error: dbError } = await (supabase as any).from('resources').insert({
        name: file.name,
        type: file.type,
        file_url: urlData.publicUrl,
        created_at: new Date().toISOString(),
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_resources'] }); toast('Fichier uploadé', 'success'); },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('resources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_resources'] }); toast('Ressource supprimée', 'success'); },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadMutation.mutate(e.target.files[0]); }} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ressources</h1>
          <p className="text-sm text-muted-foreground mt-1">Documents, supports de cours et fichiers partagés</p>
        </div>
        <Button className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}><Upload className="h-4 w-4" />{uploadMutation.isPending ? 'Upload...' : 'Uploader'}</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher une ressource..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{[1, 2, 3, 4, 5].map(c => <TableCell key={c}><div className="h-5 bg-muted rounded animate-pulse" /></TableCell>)}</TableRow>
              )) : (resources ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucune ressource</TableCell></TableRow>
              ) : (
                (resources ?? []).map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{r.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant="outline">{r.type ?? '—'}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.category ?? '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDateTime(r.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => downloadFile.mutate({ fileUrl: r.file_url, filename: r.name })} disabled={downloadFile.isPending}><Download className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { if (window.confirm('Supprimer cette ressource ?')) deleteMutation.mutate(r.id); }} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
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
