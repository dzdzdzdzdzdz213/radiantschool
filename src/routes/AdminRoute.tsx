import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminRoute() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  );
}
