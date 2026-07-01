import { useMutation, useQueryClient, type UseMutationOptions, type MutationKey } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

interface MutationFeedbackOptions<TData, TError, TVariables, TContext> extends UseMutationOptions<TData, TError, TVariables, TContext> {
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: MutationKey[];
  loadingKey?: string;
}

export function useMutationWithFeedback<TData = unknown, TError = Error, TVariables = unknown, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationFeedbackOptions<TData, TError, TVariables, TContext> = {},
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { successMessage, errorMessage, invalidateQueries } = options;

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (successMessage) toast(successMessage, 'success');
      if (invalidateQueries) {
        invalidateQueries.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
    onError: (error, variables, context) => {
      const message = errorMessage ?? (error instanceof Error ? error.message : 'Une erreur est survenue');
      toast(message, 'error');
    },
  });
}

export function useUpdateUserSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, settings }: { userId: string; settings: Record<string, unknown> }) => {
      const { error } = await (supabase as any).from('users').update(settings).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Paramètres mis à jour', 'success');
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Erreur lors de la mise à jour', 'error');
    },
  });
}

export function useUpdatePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: '', password: currentPassword });
      if (signInError) throw new Error('Mot de passe actuel incorrect');

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Mot de passe mis à jour avec succès', 'success');
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Erreur lors du changement de mot de passe', 'error');
    },
  });
}

export function useSendMessage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content, senderId }: { conversationId: string; content: string; senderId: string }) => {
      const { error } = await (supabase as any).from('messages').insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;

      await (supabase as any).from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', conversationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Erreur lors de l\'envoi du message', 'error');
    },
  });
}

export function useDownloadFile() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ fileUrl, filename }: { fileUrl: string; filename: string }) => {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Impossible de télécharger le fichier');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast('Téléchargement terminé', 'success');
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Erreur lors du téléchargement', 'error');
    },
  });
}

export function useMarkNotificationsRead() {
  const { toast } = useToast();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await (supabase as any).from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Notifications marquées comme lues', 'success');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Erreur', 'error');
    },
  });
}

export function useDeleteNotification() {
  const { toast } = useToast();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Notification supprimée', 'success');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Erreur', 'error');
    },
  });
}

export function useSubmitReview() {
  const { toast } = useToast();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, teacherId, rating, comment }: { studentId: string; teacherId: string; rating: number; comment: string }) => {
      const { error } = await (supabase as any).from('evaluations').upsert({
        student_id: studentId,
        teacher_id: teacherId,
        overall_rating: rating,
        comment,
        created_at: new Date().toISOString(),
      }, { onConflict: 'student_id,teacher_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast('Avis envoyé avec succès', 'success');
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['student_my_reviews'] });
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Erreur lors de l\'envoi de l\'avis', 'error');
    },
  });
}