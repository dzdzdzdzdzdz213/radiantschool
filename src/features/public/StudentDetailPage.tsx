import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getFullName, formatDate, formatCurrency, getRoleLabel, getStatusColor } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLang();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*, students(*)').eq('id', id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading, error: enrollError } = useQuery({
    queryKey: ['user_enrollments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*, course:courses(name, type, price, status)')
        .eq('student_id', id!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: payments = [], isLoading: paymentsLoading, error: payError } = useQuery({
    queryKey: ['user_payments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (userError) toast(t('errors.load_error', lang, t('common.student', lang)), 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userError]);
  useEffect(() => {
    if (enrollError) toast(t('errors.load_error', lang, t('nav.registrations', lang)), 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollError]);
  useEffect(() => {
    if (payError) toast(t('errors.load_error', lang, t('nav.payments', lang)), 'error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payError]);

  if (userLoading) return <div className="p-8 text-center text-muted-foreground">{t('common.loading', lang)}</div>;
  if (!user) return <div className="p-8 text-center text-muted-foreground">{t('errors.not_found', lang)}</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="btn-ghost h-8 gap-1.5 text-sm"><ArrowLeft className="h-4 w-4" /> {t('common.back', lang)}</button>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{getFullName(user.first_name, user.last_name)}</h1>
            <p className="text-muted-foreground">{getRoleLabel(user.role)} · <span className={getStatusColor(user.status)}>{user.status}</span></p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">{t('common.info', lang)}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{user.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{user.phone || t('common.not_assigned', lang)}</span></div>
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{t('common.registered_on', lang)} {formatDate(user.created_at)}</span></div>
            {user.students && (() => {
              const sr = Array.isArray(user.students) ? user.students[0] : user.students;
              if (!sr) return null;
              return (
                <>
                  <p>Matricule: {sr.registration_number}</p>
                  <p>Type: {sr.student_type}</p>
                  <p>RFID: {sr.rfid_tag || 'Non assigné'}</p>
                </>
              );
            })()}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">{t('nav.courses', lang)} ({enrollments?.length || 0})</h2>
          {enrollmentsLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', lang)}</div>
          ) : (
            <div className="space-y-2">
              {enrollments?.length > 0 ? enrollments.map((e) => (
                <div key={e.id} className="rounded-lg bg-page p-3 text-sm">
                  <p className="font-medium">{e.course?.name}</p>
                  <p className="text-muted-foreground">{e.course?.type} · {e.course?.price != null ? formatCurrency(e.course.price) : '—'}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>}
            </div>
          )}
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">{t('nav.payments', lang)} ({payments?.length || 0})</h2>
          {paymentsLoading ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', lang)}</div>
          ) : (
            <div className="space-y-2">
              {payments?.length > 0 ? payments.map((p) => (
                <div key={p.id} className="rounded-lg bg-page p-3 text-sm">
                  <p className="font-medium">{formatCurrency(p.amount)}</p>
                  <p className="text-muted-foreground">{p.payment_method} · {formatDate(p.created_at)}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">{t('common.no_data', lang)}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
