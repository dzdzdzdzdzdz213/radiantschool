import { useAuth } from '@/hooks/useAuth';
import { useAssistantDashboard } from './useAssistantDashboard';
import KpiCards from './components/KpiCards';
import QuickActions from './components/QuickActions';
import AlertsWidget from './components/AlertsWidget';
import PendingRegistrations from './components/PendingRegistrations';
import OverduePayments from './components/OverduePayments';
import ActiveTeachers from './components/ActiveTeachers';
import RoomOccupancy from './components/RoomOccupancy';
import TodaySchedule from './components/TodaySchedule';
import RfidSummary from './components/RfidSummary';

export default function AssistantDashboardPage() {
  const { profile } = useAuth();
  const { kpi, pendingRegistrations, overduePayments, roomStatus, activeTeachers, alerts, quickActions, scheduleData, scheduleLoading, rfidData, isLoading, isError } = useAssistantDashboard();

  if (isError) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Bonjour, {profile?.firstName ?? ''}</h1><p className="text-sm text-muted-foreground mt-1">Voici le résumé des opérations du jour</p></div>
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
          <h1 className="text-2xl font-bold tracking-tight">
            Bonjour, {profile?.firstName ?? ''}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Voici le résumé des opérations du jour
          </p>
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <AlertsWidget alerts={alerts} loading={isLoading} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        <KpiCards kpi={kpi} loading={isLoading} />
      </div>

      <QuickActions actions={quickActions} />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <PendingRegistrations data={pendingRegistrations} loading={isLoading} />
        <OverduePayments data={overduePayments} loading={isLoading} />
        <ActiveTeachers data={activeTeachers} loading={isLoading} />
        <RoomOccupancy data={roomStatus} loading={isLoading} />
        <TodaySchedule data={scheduleData} loading={scheduleLoading} />
        <RfidSummary data={rfidData} totalScans={kpi.rfidScansToday} loading={isLoading} />
      </div>
    </div>
  );
}