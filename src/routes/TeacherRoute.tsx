import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TeacherLayout from '@/layouts/TeacherLayout';

export default function TeacherRoute() {
  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <TeacherLayout />
    </ProtectedRoute>
  );
}
