import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function CampaignsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: campaigns, isLoading, isError } = useQuery({
    queryKey: ['assistant_campaigns'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .order('start_date', { ascending: false });
      return data ?? [];
    },
  });

  useEffect(() => {
    if (isError) toast('Erreur lors du chargement des campagnes', 'error');
  }, [isError]);

  const [showModal, setShowModal] = useState(false);
  const [campName, setCampName] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campStart, setCampStart] = useState('');
  const [campEnd, setCampEnd] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!campName.trim()) throw new Error('Le nom de la campagne est requis');
      if (!campStart || !campEnd) throw new Error('Les dates de début et fin sont requises');
      if (new Date(campEnd) <= new Date(campStart)) throw new Error('La date de fin doit être après la date de début');
      const { error } = await (supabase as any).from('campaigns').insert({
        name: campName.trim(),
        description: campDesc.trim() || null,
        start_date: campStart,
        end_date: campEnd,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assistant_campaigns'] }); toast('Campagne créée', 'success'); setShowModal(false); setCampName(''); setCampDesc(''); setCampStart(''); setCampEnd(''); },
    onError: (err: any) => toast(err?.message ?? 'Erreur', 'error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campagnes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les campagnes d'inscription</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)} disabled={createMutation.isPending}><Plus className="h-4 w-4" />Nouvelle campagne</Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <Card className="relative w-full max-w-lg mx-4">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">Nouvelle campagne</CardTitle>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input placeholder="Nom de la campagne" value={campName} onChange={e => setCampName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Description (optionnelle)" value={campDesc} onChange={e => setCampDesc(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de début *</Label>
                  <Input type="date" value={campStart} onChange={e => setCampStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date de fin *</Label>
                  <Input type="date" value={campEnd} onChange={e => setCampEnd(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>Annuler</Button>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Création...' : 'Créer la campagne'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader className="pb-3"><div className="h-24 bg-muted rounded-xl animate-pulse" /></CardHeader></Card>
        )) : (campaigns ?? []).length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" /><p>Aucune campagne</p>
          </div>
        ) : (campaigns ?? []).map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <Badge variant={c.is_active ? 'success' : 'outline'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(c.start_date)} - {formatDate(c.end_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Places max: {c.max_seats ?? 'Illimité'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
