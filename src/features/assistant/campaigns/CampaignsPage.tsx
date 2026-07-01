import { Plus, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

export default function CampaignsPage() {
  const { data: campaigns } = useQuery({
    queryKey: ['assistant_campaigns'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('campaigns')
        .select('*')
        .order('start_date', { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campagnes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérer les campagnes d'inscription</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nouvelle campagne</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(campaigns ?? []).map((c: any) => (
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