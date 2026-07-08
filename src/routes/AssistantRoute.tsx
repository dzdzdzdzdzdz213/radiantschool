import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AssistantLayout from '@/layouts/AssistantLayout';

export default function AssistantRoute() {
  return (
    <ProtectedRoute allowedRoles={['assistant']}>
      <AssistantLayout />
    </ProtectedRoute>
  );
}
