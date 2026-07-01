import { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function RfidPage() {
  const [scanInput, setScanInput] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scanner RFID</h1>
        <p className="text-sm text-muted-foreground mt-1">Scanner les badges RFID et suivre les entrées/sorties</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Scan en direct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Scanner un badge ou entrer un code RFID..."
                value={scanInput}
                onChange={e => setScanInput(e.target.value)}
                className="h-12 pl-9 text-lg font-mono"
                autoFocus
              />
            </div>
            <div className="rounded-xl bg-accent/50 p-8 text-center">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">En attente de scan...</p>
              <p className="text-xs text-muted-foreground mt-1">Scannez un badge RFID ou saisissez le code manuellement</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Derniers scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-accent/50 p-3">
                  <div>
                    <p className="text-sm font-medium">Élève {i + 1}</p>
                    <p className="text-xs text-muted-foreground">10:{String(30 + i).padStart(2, '0')}</p>
                  </div>
                  <Badge variant={i % 3 === 0 ? 'destructive' : 'success'}>
                    {i % 3 === 0 ? 'Échec' : 'OK'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Historique des scans aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Élève</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Chargement...</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}