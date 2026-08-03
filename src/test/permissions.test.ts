import { describe, expect, test } from 'vitest';
import { hasPermission, canAccessRoute, getDefaultRoute } from '@/lib/permissions';
import { PERMISSIONS } from '@/types/models';
import type { UserProfile } from '@/types/models';

const makeUser = (role: UserProfile['role']): UserProfile => ({
  id: 'u1',
  email: 'u@test.dz',
  firstName: 'Test',
  lastName: 'User',
  role,
  status: 'active',
  emailVerified: true,
});

const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((resource) => Object.values(resource));

describe('hasPermission — RBAC boundary', () => {
  test('returns false for null user (unauthenticated)', () => {
    for (const permission of ALL_PERMISSIONS) {
      expect(hasPermission(null, permission)).toBe(false);
    }
    expect(hasPermission(null, 'users:read')).toBe(false);
  });

  test('returns false for unknown permission strings', () => {
    const user = makeUser('assistant');
    expect(hasPermission(user, 'nonexistent:permission')).toBe(false);
    expect(hasPermission(user, '')).toBe(false);
  });

  test('admin has every permission via wildcard', () => {
    const admin = makeUser('admin');
    for (const permission of ALL_PERMISSIONS) {
      expect(hasPermission(admin, permission)).toBe(true);
    }
    expect(hasPermission(admin, 'payments:read')).toBe(true);
    expect(hasPermission(admin, 'users:delete')).toBe(true);
  });

  test('assistant has its permission set', () => {
    const assistant = makeUser('assistant');
    for (const permission of [
      'users:read',
      'courses:read', 'courses:create', 'courses:update',
      'payments:read',
      'attendance:read', 'attendance:create',
      'reports:read', 'reports:export',
    ]) {
      expect(hasPermission(assistant, permission), permission).toBe(true);
    }
  });

  test('assistant is denied write permissions it lacks', () => {
    const assistant = makeUser('assistant');
    for (const permission of ['users:create', 'users:update', 'users:delete', 'users:approve', 'payments:refund']) {
      expect(hasPermission(assistant, permission), permission).toBe(false);
    }
  });

  test('teacher has its permission set', () => {
    const teacher = makeUser('teacher');
    for (const permission of ['courses:read', 'attendance:read', 'users:read']) {
      expect(hasPermission(teacher, permission), permission).toBe(true);
    }
  });

  test('teacher cannot create/update courses or manage payments', () => {
    const teacher = makeUser('teacher');
    for (const permission of ['courses:create', 'courses:update', 'courses:delete', 'payments:read', 'reports:read', 'reports:export']) {
      expect(hasPermission(teacher, permission), permission).toBe(false);
    }
  });

  test('student has its permission set', () => {
    const student = makeUser('student');
    for (const permission of ['courses:read', 'attendance:read', 'payments:read']) {
      expect(hasPermission(student, permission), permission).toBe(true);
    }
  });

  test('student cannot touch staff-only permissions', () => {
    const student = makeUser('student');
    for (const permission of ['users:read', 'courses:create', 'attendance:create', 'reports:read', 'payments:create', 'payments:refund']) {
      expect(hasPermission(student, permission), permission).toBe(false);
    }
  });

  test('parent has its permission set', () => {
    const parent = makeUser('parent');
    for (const permission of ['users:read', 'attendance:read', 'payments:read']) {
      expect(hasPermission(parent, permission), permission).toBe(true);
    }
  });

  test('parent cannot reach assistant/admin-only actions', () => {
    const parent = makeUser('parent');
    for (const permission of ['courses:create', 'courses:update', 'attendance:create', 'reports:read', 'reports:export', 'payments:create']) {
      expect(hasPermission(parent, permission), permission).toBe(false);
    }
  });

  test('removed payment-write permissions are denied for every non-admin role', () => {
    for (const role of ['assistant', 'teacher', 'student', 'parent'] as const) {
      expect(hasPermission(makeUser(role), 'payments:create')).toBe(false);
      expect(hasPermission(makeUser(role), 'payments:refund')).toBe(false);
    }
  });

  test('payments:read remains available to roles that need it', () => {
    for (const role of ['admin', 'assistant', 'student', 'parent'] as const) {
      expect(hasPermission(makeUser(role), 'payments:read'), role).toBe(true);
    }
  });
});

describe('canAccessRoute — route-level guard', () => {
  test('admin can access any route', () => {
    const admin = makeUser('admin');
    for (const route of ['/admin/dashboard', '/assistant/dashboard', '/teacher/dashboard', '/student/dashboard', '/parent/dashboard', '/payments']) {
      expect(canAccessRoute(admin, route)).toBe(true);
    }
  });

  test('each role only matches its own prefix (admin excluded — wildcard)', () => {
    const roleToRoute: Record<Exclude<UserProfile['role'], 'admin'>, string> = {
      assistant: '/assistant',
      teacher: '/teacher',
      student: '/student',
      parent: '/parent',
    };
    for (const [role, route] of Object.entries(roleToRoute)) {
      const user = makeUser(role as Exclude<UserProfile['role'], 'admin'>);
      expect(canAccessRoute(user, route)).toBe(true);
      for (const other of Object.values(roleToRoute)) {
        if (other !== route) expect(canAccessRoute(user, other), `${role} vs ${other}`).toBe(false);
      }
      expect(canAccessRoute(user, '/admin')).toBe(false);
    }
  });

  test('returns false for null user', () => {
    expect(canAccessRoute(null, '/admin/dashboard')).toBe(false);
  });
});

describe('getDefaultRoute — role landing pages', () => {
  test('maps each role to its dashboard', () => {
    expect(getDefaultRoute('admin')).toBe('/admin/dashboard');
    expect(getDefaultRoute('assistant')).toBe('/assistant/dashboard');
    expect(getDefaultRoute('teacher')).toBe('/teacher/dashboard');
    expect(getDefaultRoute('student')).toBe('/student/dashboard');
    expect(getDefaultRoute('parent')).toBe('/parent/dashboard');
  });
});
