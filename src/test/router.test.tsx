import { describe, expect, test } from 'vitest';

describe('Router', () => {
  test('exports router with routes', async () => {
    const mod = await import('@/website/router');
    expect(mod.router).toBeDefined();
    expect(mod.router.routes.length).toBeGreaterThan(0);
  }, 15000);

  test('has public, protected, and catch-all routes', async () => {
    const mod = await import('@/website/router');
    const routes = mod.router.routes[0]?.children ?? mod.router.routes;
    const paths = routes.map((r: any) => r.path ?? '');
    expect(paths).toContain('/login');
    expect(paths).toContain('/');
    expect(paths).toContain('/student');
    expect(paths).toContain('/admin');
    expect(paths).toContain('*');
  }, 15000);
});
