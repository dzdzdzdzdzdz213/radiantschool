import { useMutation, useQueryClient, type UseMutationOptions, type MutationKey } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

/**
 * Extended mutation options that add toast notifications and automatic
 * query invalidation on success.
 */
interface MutationFeedbackOptions<TData, TError, TVariables, TContext> extends UseMutationOptions<TData, TError, TVariables, TContext> {
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: MutationKey[];
  loadingKey?: string;
}

/**
 * Wraps a mutation function with automatic success/error toast
 * notifications and optional query key invalidation on success.
 */
export function useMutationWithFeedback<TData = unknown, TError = Error, TVariables = unknown, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationFeedbackOptions<TData, TError, TVariables, TContext> = {},
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { successMessage, errorMessage, invalidateQueries } = options;

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onSuccess: (_data, _variables, _context) => {
      if (successMessage) toast(successMessage, 'success');
      if (invalidateQueries) {
        invalidateQueries.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
    onError: (error, _variables, _context) => {
      const message = errorMessage ?? (error instanceof Error ? error.message : 'Une erreur est survenue');
      toast(message, 'error');
    },
  });
}

/** Updates a user's settings row and invalidates the profile cache. */
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

/** Changes the current user's password after verifying the current password. */
export function useUpdatePassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ currentPassword, newPassword, email }: { currentPassword: string; newPassword: string; email?: string }) => {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email ?? '', password: currentPassword });
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

/** Sends a message to another user and invalidates the messages cache. */
export function useSendMessage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, subject, body, senderId }: { receiverId: string; subject: string; body: string; senderId: string }) => {
      const { error } = await (supabase as any).from('messages').insert({
        sender_id: senderId,
        receiver_id: receiverId,
        subject,
        body,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (err: any) => {
      toast(err?.message ?? 'Erreur lors de l\'envoi du message', 'error');
    },
  });
}

/** Downloads a file from a URL by creating a temporary anchor element. */
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

/** Marks all unread notifications as read for the current user. */
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

/** Deletes a single notification by ID. */
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

/** Upserts a teacher evaluation from a student. Invalidates `reviews` and `student_my_reviews` caches. */
export function useSubmitReview() {
  const { toast } = useToast();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, teacherId, rating, comment }: { studentId: string; teacherId: string; rating: number; comment: string }) => {
      const { error } = await (supabase as any).from('evaluations').upsert({
        student_id: studentId,
        teacher_id: teacherId,
        teaching_quality: rating,
        communication: rating,
        punctuality: rating,
        organization: rating,
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