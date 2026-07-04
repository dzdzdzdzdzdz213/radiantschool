import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import type { ChildInfo } from '../useParentDashboard';

interface ChildrenOverviewProps {
  childList: ChildInfo[];
  loading?: boolean;
}

export default function ChildrenOverview({ childList: children, loading }: ChildrenOverviewProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        {[1, 2].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Mes enfants
        </h3>
        {children.length > 0 && (
          <button onClick={() => navigate('/parent/children')} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
            Voir tout <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      {children.length === 0 ? (
        <div className="text-center py-6">
          <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-20" />
          <p className="text-sm text-muted-foreground">Aucun enfant inscrit</p>
          <button onClick={() => navigate('/parent/enroll')} className="mt-2 text-xs text-primary font-medium hover:underline">
            Inscrire un enfant
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {children.map((child) => (
            <button key={child.id} onClick={() => navigate(`/parent/children/${child.id}`)}
              className="w-full flex items-center gap-3 rounded-xl bg-accent/50 p-3 text-left hover:bg-accent transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {child.firstName.charAt(0)}{child.lastName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{child.firstName} {child.lastName}</p>
                <p className="text-xs text-muted-foreground">
                  Présence: {child.attendanceRate}% · {child.pendingHomework} devoir{child.pendingHomework !== 1 ? 's' : ''}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
