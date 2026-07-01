import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, BookOpen, ClipboardCheck, FileText, DollarSign,
  Award, Star, UserPlus, Video, TrendingUp, GraduationCap,
  ArrowRight, Bell, Play, Download, MessageSquare, CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useStudentDashboard } from '@/features/student/dashboard/useStudentDashboard';
import { getInitials } from '@/lib/utils';

const kpiConfig = [
  { key: 'attendanceRate', label: 'Taux de présence', icon: ClipboardCheck, suffix: '%', color: 'text-emerald-500' },
  { key: 'todayClasses', label: 'Cours aujourd\'hui', icon: Calendar, suffix: '', color: 'text-blue-500' },
  { key: 'homeworkDue', label: 'Devoirs à rendre', icon: FileText, suffix: '', color: 'text-amber-500' },
  { key: 'homeworkCompleted', label: 'Devoirs rendus', icon: FileText, suffix: '', color: 'text-emerald-500' },
  { key: 'coursesEnrolled', label: 'Cours inscrits', icon: BookOpen, suffix: '', color: 'text-violet-500' },
  { key: 'upcomingLessons', label: 'Prochains cours', icon: Clock, suffix: '', color: 'text-sky-500' },
  { key: 'pendingPayments', label: 'Paiements en attente', icon: DollarSign, suffix: '', color: 'text-red-500' },
  { key: 'remainingBalance', label: 'Solde restant', icon: CreditCard, suffix: ' DA', color: 'text-orange-500' },
  { key: 'learningProgress', label: 'Progression', icon: TrendingUp, suffix: '%', color: 'text-primary' },
  { key: 'privateLessons', label: 'Cours particuliers', icon: UserPlus, suffix: '', color: 'text-indigo-500' },
  { key: 'vipLessons', label: 'Cours VIP', icon: Star, suffix: '', color: 'text-amber-500' },
  { key: 'certificatesEarned', label: 'Certificats', icon: Award, suffix: '', color: 'text-emerald-500' },
];

const quickActions = [
  { label: 'Rejoindre un cours', path: '/student/online-classes', icon: Video, color: 'bg-violet-500/10 text-violet-600' },
  { label: 'Voir l\'emploi du temps', path: '/student/schedule', icon: Calendar, color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Soumettre un devoir', path: '/student/homework', icon: FileText, color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Télécharger un cours', path: '/student/resources', icon: Download, color: 'bg-emerald-500/10 text-emerald-600' },
  { label: 'Payer une facture', path: '/student/payments', icon: CreditCard, color: 'bg-red-500/10 text-red-600' },
  { label: 'Cours particuliers', path: '/student/private-lessons', icon: UserPlus, color: 'bg-indigo-500/10 text-indigo-600' },
  { label: 'Contacter un professeur', path: '/student/messages', icon: MessageSquare, color: 'bg-sky-500/10 text-sky-600' },
  { label: 'Voir mes présences', path: '/student/attendance', icon: ClipboardCheck, color: 'bg-primary/10 text-primary' },
];

function KpiCard({ item, value, isLoading }: { item: typeof kpiConfig[0]; value: number | string; isLoading: boolean }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl ${item.color.replace('text-', 'bg-').replace('600', '500')}/10 flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${item.color}`} />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2"><Skeleton className="h-8 w-20" /><Skeleton className="h-3 w-28" /></div>
      ) : (
        <>
          <p className="text-2xl font-bold tracking-tight">{value}{item.suffix}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
        </>
      )}
    </motion.div>
  );
}

export default function StudentDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { kpi, kpiLoading } = useStudentDashboard();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 17) return 'Bon après-midi';
    return 'Bonsoir';
  });

  const kpiValues: Record<string, number> = {
    attendanceRate: kpi?.attendanceRate ?? 0,
    todayClasses: kpi?.todayClasses ?? 0,
    homeworkDue: kpi?.homeworkDue ?? 0,
    homeworkCompleted: kpi?.homeworkCompleted ?? 0,
    coursesEnrolled: kpi?.coursesEnrolled ?? 0,
    upcomingLessons: kpi?.upcomingLessons ?? 0,
    pendingPayments: kpi?.pendingPayments ?? 0,
    remainingBalance: kpi?.remainingBalance ?? 0,
    learningProgress: kpi?.learningProgress ?? 0,
    privateLessons: kpi?.privateLessons ?? 0,
    vipLessons: kpi?.vipLessons ?? 0,
    certificatesEarned: kpi?.certificatesEarned ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{greeting}, {profile?.firstName ?? ''}</h1>
              <p className="text-sm text-muted-foreground">
                {kpi?.nextClassToday ? (
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Prochain cours: {kpi.nextClassCourse} à {kpi.nextClassTime}</span>
                ) : (
                  'Aucun cours prévu aujourd\'hui'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpiConfig.slice(0, 8).map(item => (
          <KpiCard key={item.key} item={item} value={kpiValues[item.key]} isLoading={kpiLoading} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiConfig.slice(8).map(item => (
          <KpiCard key={item.key} item={item} value={kpiValues[item.key]} isLoading={kpiLoading} />
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Actions rapides</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-accent/50 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Cours aujourd'hui</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('/student/schedule')}>
              Voir tout <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {kpiLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-16 rounded-xl" />))}</div>
            ) : kpi && kpi.todayClasses > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-xl bg-accent/50 p-4">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{kpi.nextClassCourse ?? 'Cours'}</p>
                    <p className="text-xs text-muted-foreground">{kpi.nextClassTime ?? ''} · {kpi.nextClassRoom ?? ''}</p>
                  </div>
                  <Badge variant="outline">{kpi.todayClasses} cours</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground"><Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="text-sm">Aucun cours prévu aujourd'hui</p></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Progression</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('/student/courses')}>
              Mes cours <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {kpiLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-12 rounded-xl" />))}</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span>Progression globale</span><span className="font-medium">{kpi?.learningProgress ?? 0}%</span></div>
                  <div className="h-2.5 bg-accent rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${kpi?.learningProgress ?? 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm"><span>Présence</span><span className="font-medium">{kpi?.attendanceRate ?? 0}%</span></div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kpi?.attendanceRate ?? 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-2 rounded-lg bg-accent/50"><p className="text-lg font-bold">{kpi?.coursesEnrolled ?? 0}</p><p className="text-[10px] text-muted-foreground">Inscrit</p></div>
                  <div className="text-center p-2 rounded-lg bg-accent/50"><p className="text-lg font-bold">{kpi?.homeworkCompleted ?? 0}</p><p className="text-[10px] text-muted-foreground">Rendu</p></div>
                  <div className="text-center p-2 rounded-lg bg-accent/50"><p className="text-lg font-bold">{kpi?.certificatesEarned ?? 0}</p><p className="text-[10px] text-muted-foreground">Certificats</p></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}