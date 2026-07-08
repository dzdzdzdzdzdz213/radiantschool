import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StudentLayout from '@/layouts/StudentLayout';

export default function StudentRoute() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentLayout />
    </ProtectedRoute>
  );
}
