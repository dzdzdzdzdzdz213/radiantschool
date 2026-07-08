import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ParentLayout from '@/layouts/ParentLayout';

export default function ParentRoute() {
  return (
    <ProtectedRoute allowedRoles={['parent']}>
      <ParentLayout />
    </ProtectedRoute>
  );
}
