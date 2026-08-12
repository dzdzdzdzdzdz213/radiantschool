import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WATCHED_TABLES } from '@/hooks/useRealtime';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Radio, Pause, Play, Eraser, Search, Activity, Wifi, WifiOff } from 'lucide-react';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

interface LogEntry {
  id: number;
  ts: number;
  table: string;
  eventType: EventType | 'HISTORY';
  preview: string;
}

const MAX_ENTRIES = 300;
const DISPLAY_FIELDS = ['name', 'first_name', 'last_name', 'email', 'title', 'status', 'amount'];

const eventColors: Record<string, string> = {
  INSERT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  HISTORY: 'bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300',
};

function buildPreview(eventType: EventType, row: Record<string, unknown> | null): string {
  if (!row || typeof row !== 'object') return '';
  const parts: string[] = [];
  if ('id' in row) parts.push(`id=${String(row.id)}`);
  for (const f of DISPLAY_FIELDS) {
    if (row[f] !== undefined && row[f] !== null) parts.push(`${f}=${String(row[f])}`);
  }
  let json = '';
  try {
    json = JSON.stringify(row).slice(0, 180);
  } catch {
    json = '';
  }
  if (parts.length > 1) return `${parts.slice(0, 4).join(' ')} · ${json}`;
  return json;
}

function timeStr(ts: number): string {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour12: false });
}

export default function LiveLogPage() {
  const { lang } = useLang();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const pendingRef = useRef<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [status, setStatus] = useState<'connecting' | 'live' | 'error'>('connecting');
  const [tableFilter, setTableFilter] = useState('*');
  const [eventFilter, setEventFilter] = useState<'*' | EventType>('*');
  const [search, setSearch] = useState('');
  const seqRef = useRef(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<LogEntry[]>([]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const push = useCallback((entry: Omit<LogEntry, 'id' | 'ts'>) => {
    const item: LogEntry = { id: ++seqRef.current, ts: Date.now(), ...entry };
    if (pausedRef.current) {
      pendingRef.current = [...pendingRef.current, item];
      return;
    }
    entriesRef.current = [item, ...entriesRef.current].slice(0, MAX_ENTRIES);
    setEntries(entriesRef.current);
  }, []);

  useEffect(() => {
    const channel: RealtimeChannel = supabase.channel('live-log-feed');
    for (const table of WATCHED_TABLES) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          const eventType = payload.eventType as EventType;
          const row = (eventType === 'DELETE' ? payload.old : payload.new) as Record<string, unknown> | null;
          push({ table, eventType, preview: buildPreview(eventType, row) });
        },
      );
    }
    channel.subscribe((chStatus) => {
      if (chStatus === 'SUBSCRIBED') setStatus('live');
      else if (chStatus === 'CLOSED') setStatus('connecting');
      else setStatus('error');
    });

    void (async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('action, entity_type, entity_id')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!data?.length) return;
      const history: LogEntry[] = data.map((r, i) => ({
        id: seqRef.current++,
        ts: Date.now() - (data.length - i) * 1000,
        table: r.entity_type ?? 'audit_logs',
        eventType: 'HISTORY',
        preview: `${String(r.action ?? '')} ${r.entity_id ?? ''}`.trim(),
      }));
      entriesRef.current = [...history, ...entriesRef.current].slice(0, MAX_ENTRIES);
      setEntries(entriesRef.current);
    })();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [push]);

  useEffect(() => {
    if (!autoScroll || !feedRef.current) return;
    feedRef.current.scrollTop = 0;
  }, [entries, autoScroll]);

  const flushPending = () => {
    if (!pendingRef.current.length) return;
    entriesRef.current = [...pendingRef.current, ...entriesRef.current].slice(0, MAX_ENTRIES);
    pendingRef.current = [];
    setEntries(entriesRef.current);
    setPaused(false);
  };

  const clearFeed = () => {
    pendingRef.current = [];
    entriesRef.current = [];
    setEntries([]);
  };

  const filtered = entries.filter((e) => {
    if (tableFilter !== '*' && e.table !== tableFilter) return false;
    if (eventFilter !== '*' && e.eventType !== eventFilter) return false;
    if (search) {
      const hay = `${e.table} ${e.eventType} ${e.preview}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const counters = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.eventType] = (acc[e.eventType] ?? 0) + 1;
    return acc;
  }, {});
  const buffered = pendingRef.current.length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Radio className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{t('nav.live_log', lang)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={status === 'live' ? (paused ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400') : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}>
            {paused ? (
              <><Pause className="h-3 w-3 mr-1" />{t('common.paused', lang)}</>
            ) : status === 'live' ? (
              <><Wifi className="h-3 w-3 mr-1" />{t('common.live', lang)}</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" />{status === 'connecting' ? t('common.connecting', lang) : t('common.offline', lang)}</>
            )}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => (paused ? flushPending() : setPaused(true))}>
            {paused ? <><Play className="h-4 w-4 mr-2" />{t('common.resume', lang)}</> : <><Pause className="h-4 w-4 mr-2" />{t('common.pause', lang)}</>}
          </Button>
          <Button variant="outline" size="sm" onClick={clearFeed}>
            <Eraser className="h-4 w-4 mr-2" />{t('common.clear', lang)}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t('common.events', lang)}:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">{counters.INSERT ?? 0}</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{counters.UPDATE ?? 0}</span>
          <span className="font-semibold text-red-600 dark:text-red-400">{counters.DELETE ?? 0}</span>
          {buffered > 0 && (
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">+{buffered}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('common.autoscroll', lang)}</span>
          <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
        </div>
        <Select value={eventFilter} onValueChange={(v) => setEventFilter(v as typeof eventFilter)} className="w-40">
          <SelectItem value="*">{t('common.all_events', lang)}</SelectItem>
          <SelectItem value="INSERT">INSERT</SelectItem>
          <SelectItem value="UPDATE">UPDATE</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
        </Select>
        <Select value={tableFilter} onValueChange={setTableFilter} className="w-52">
          <SelectItem value="*">{t('common.all_tables', lang)}</SelectItem>
          {WATCHED_TABLES.map((tb) => (
            <SelectItem key={tb} value={tb}>{tb}</SelectItem>
          ))}
        </Select>
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder={t('common.search', lang)} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {filtered.length} {t('common.entries', lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={feedRef} className="h-[520px] overflow-y-auto font-mono text-xs leading-relaxed">
            {filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Radio className="h-8 w-8 animate-pulse" />
                <span className="font-sans text-sm">{t('common.waiting_events', lang)}</span>
              </div>
            ) : (
              <div className="space-y-0.5 p-3">
                {filtered.map((e) => (
                  <div key={e.id} className="flex items-start gap-2 rounded-md px-2 py-1 hover:bg-accent/50 transition-colors">
                    <span className="shrink-0 text-muted-foreground">{timeStr(e.ts)}</span>
                    <span className="shrink-0 w-32 truncate text-primary">{e.table}</span>
                    <Badge className={`shrink-0 ${eventColors[e.eventType]}`}>{e.eventType}</Badge>
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">{e.preview}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}