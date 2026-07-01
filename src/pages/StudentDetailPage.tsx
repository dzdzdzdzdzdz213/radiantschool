import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getFullName, formatDate, formatCurrency, getRoleLabel, getStatusColor } from '@/lib/utils';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('*, students(*)').eq('id', id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: enrollments } = useQuery({
    queryKey: ['user_enrollments', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('course_enrollments')
        .select('*, course:courses(name, type, price, status)')
        .eq('student_id', id!);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ['user_payments', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', id!)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  if (!user) return <div className="p-8 text-center text-muted">Chargement...</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted hover:text-muted"><ArrowLeft className="h-4 w-4" /> Retour</button>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{getFullName(user.first_name, user.last_name)}</h1>
            <p className="text-muted">{getRoleLabel(user.role)} · <span className={getStatusColor(user.status)}>{user.status}</span></p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Informations</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted" /><span>{user.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted" /><span>{user.phone || 'Non renseigné'}</span></div>
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted" /><span>Inscrit le {formatDate(user.created_at)}</span></div>
            {user.students && (
              <>
                <p>Matricule: {user.students.registration_number}</p>
                <p>Type: {user.students.student_type}</p>
                <p>RFID: {user.students.rfid_tag || 'Non assigné'}</p>
              </>
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Cours ({enrollments?.length || 0})</h2>
          <div className="space-y-2">
            {enrollments?.map((e: any) => (
              <div key={e.id} className="rounded-lg bg-page p-3 text-sm">
                <p className="font-medium">{e.course?.name}</p>
                <p className="text-muted">{e.course?.type} · {formatCurrency(e.course?.price)}</p>
              </div>
            )) || <p className="text-sm text-muted">Aucun cours</p>}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Paiements ({payments?.length || 0})</h2>
          <div className="space-y-2">
            {payments?.map((p: any) => (
              <div key={p.id} className="rounded-lg bg-page p-3 text-sm">
                <p className="font-medium">{formatCurrency(p.amount)}</p>
                <p className="text-muted">{p.payment_method} · {formatDate(p.created_at)}</p>
              </div>
            )) || <p className="text-sm text-muted">Aucun paiement</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
