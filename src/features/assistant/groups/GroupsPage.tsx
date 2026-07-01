import { useState, useEffect } from 'react';
import { Search, Plus, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

export default function GroupsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ['assistant_groups'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('courses')
        .select('id, name, type, capacity, current_enrollments, status, level:levels(name)')
        .order('name');
      return data ?? [];
    },
  });

  useEffect(() => {
    if (isError) toast('Erreur lors du chargement des groupes', 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCapacity, setGroupCapacity] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!groupName.trim()) throw new Error('Le nom du groupe est requis');
      const capacity = parseInt(groupCapacity, 10);
      if (isNaN(capacity) || capacity <= 0) throw new Error('La capacité doit être supérieure à 0');
      const { error } = await (supabase as any).from('courses').insert({ name: groupName.trim(), description: groupDesc.trim(), capacity, type: 'normal', status: 'active' });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_groups'] }); toast('Groupe créé', 'success'); setShowModal(false); setGroupName(''); setGroupDesc(''); setGroupCapacity(''); },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groupes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les groupes et assigner les élèves</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)} disabled={createMutation.isPending}><Plus className="h-4 w-4" />Nouveau groupe</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">Nouveau groupe</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du groupe *</Label>
                <Input placeholder="Nom" value={groupName} onChange={e => setGroupName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Description (optionnelle)" value={groupDesc} onChange={e => setGroupDesc(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Capacité *</Label>
                <Input type="number" placeholder="Nombre de places" value={groupCapacity} onChange={e => setGroupCapacity(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Création...' : 'Créer le groupe'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : (groups ?? []).length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Aucun groupe</p>
          </div>
        ) : (groups ?? []).map((g: any) => (
          <Card key={g.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{g.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.level?.name ?? '—'}</p>
                </div>
                <Badge variant={g.status === 'active' ? 'success' : 'outline'}>
                  {g.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{g.current_enrollments ?? 0}/{g.capacity}</span>
                </div>
                <span className="text-xs text-muted-foreground">{g.type}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-accent overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(((g.current_enrollments ?? 0) / (g.capacity || 1)) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
