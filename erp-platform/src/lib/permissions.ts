import type { UserRole, UserProfile } from '@/types/models';

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  assistant: [
    'users:read',
    'courses:read', 'courses:create', 'courses:update',
    'payments:read', 'payments:create',
    'attendance:read', 'attendance:create',
    'reports:read', 'reports:export',
  ],
  teacher: [
    'courses:read',
    'attendance:read',
    'users:read',
  ],
  student: [
    'courses:read',
    'attendance:read',
    'payments:read',
  ],
  parent: [
    'users:read',
    'attendance:read',
    'payments:read',
  ],
};

export function hasPermission(user: UserProfile | null, permission: string): boolean {
  if (!user) return false;
  const perms = rolePermissions[user.role] || [];
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

export function canAccessRoute(user: UserProfile | null, route: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (route.startsWith(`/${user.role}`)) return true;
  return false;
}

export function getDefaultRoute(role: UserRole): string {
  const routes: Record<UserRole, string> = {
    admin: '/admin/dashboard',
    assistant: '/assistant/dashboard',
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    parent: '/parent/dashboard',
  };
  return routes[role] || '/login';
}
