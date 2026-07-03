import { useAuth } from '@/hooks/useAuth';
import { useTeacherDashboard } from './useTeacherDashboard';
import TeacherKpiCards from './components/TeacherKpiCards';
import { BookOpen, ClipboardCheck, FileText, Bell, Calendar, BarChart3, Users, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const quickActions = [
  { label: 'Prendre les présences', icon: ClipboardCheck, path: '/teacher/attendance', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
  { label: 'Uploader ressource', icon: FileText, path: '/teacher/resources', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
  { label: 'Créer un devoir', icon: BookOpen, path: '/teacher/assignments', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
  { label: 'Publier annonce', icon: Bell, path: '/teacher/announcements', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
  { label: 'Démarrer cours en ligne', icon: Video, path: '/teacher/online-classes', color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' },
  { label: 'Voir emploi du temps', icon: Calendar, path: '/teacher/schedule', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' },
  { label: 'Rapport de présence', icon: BarChart3, path: '/teacher/reports', color: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400' },
  { label: 'Liste des élèves', icon: Users, path: '/teacher/students', color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400' },
];

export default function TeacherDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { kpi, todayClasses, isLoading, isError } = useTeacherDashboard();

  if (isError) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Bonjour, {profile?.firstName ?? ''}</h1><p className="text-sm text-muted-foreground mt-1">Votre tableau de bord enseignant</p></div>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 font-medium">Erreur de chargement des données</p>
          <p className="text-sm text-red-500 mt-1">Veuillez rafraîchir la page ou réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bonjour, {profile?.firstName ?? ''}</h1>
          <p className="text-sm text-muted-foreground mt-1">Votre tableau de bord enseignant</p>
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        <TeacherKpiCards kpi={kpi} loading={isLoading} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((action, idx) => (
            <motion.button key={action.path} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: idx * 0.02 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all hover:bg-accent hover:shadow-sm active:scale-95"
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', action.color)}>
                <action.icon className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Cours aujourd'hui
          </h3>
          {todayClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucun cours programmé aujourd'hui</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl bg-accent/50 p-3">
                  <div className="flex flex-col items-center justify-center min-w-[48px]">
                    <span className="text-sm font-bold">{c.startTime?.slice(0, 5)}</span>
                    <span className="text-[10px] text-muted-foreground">{c.endTime?.slice(0, 5)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.courseName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.roomName} • {c.studentCount} élèves</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {c.studentCount} prés.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Aperçu du mois
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Heures d\'enseignement', value: `${kpi.teachingHoursMonth}h`, color: 'text-blue-600', progress: Math.min(kpi.teachingHoursMonth / 40 * 100, 100) },
              { label: 'Revenu', value: `${(kpi.revenueMonth / 1000).toFixed(1)}k DA`, color: 'text-green-600', progress: Math.min(kpi.revenueMonth / 100000 * 100, 100) },
              { label: 'Taux de présence', value: `${kpi.attendanceRate}%`, color: 'text-emerald-600', progress: kpi.attendanceRate },
              { label: 'Devoirs à corriger', value: String(kpi.assignmentsPending), color: 'text-amber-600', progress: Math.min(kpi.assignmentsPending * 10, 100) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={cn('font-semibold', item.color)}>{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-accent overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', item.color.replace('text-', 'bg-'))} style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}