import { Users } from 'lucide-react';
import type { ActiveTeacher } from '../useAssistantDashboard';

interface ActiveTeachersProps {
  data: ActiveTeacher[];
  loading?: boolean;
}

export default function ActiveTeachers({ data, loading }: ActiveTeachersProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-36 bg-muted rounded animate-pulse" />
        {[1, 2].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        Enseignants en cours
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Aucun cours en ce moment</p>
      ) : (
        <div className="space-y-2">
          {data.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl bg-accent/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {t.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground truncate">{t.course} • {t.room}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{t.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}