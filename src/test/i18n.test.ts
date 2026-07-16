import { describe, it, expect } from 'vitest';

describe('i18n', () => {
  it('t() returns translated French strings', async () => {
    const { t } = await import('@/i18n');
    expect(t('common.save', 'fr')).toBe('Enregistrer');
    expect(t('nav.dashboard', 'fr')).toBe('Tableau de bord');
  });

  it('t() returns English strings', async () => {
    const { t } = await import('@/i18n');
    expect(t('common.save', 'en')).toBe('Save');
    expect(t('auth.login', 'en')).toBe('Sign in');
  });

  it('t() returns Arabic strings', async () => {
    const { t } = await import('@/i18n');
    expect(t('common.save', 'ar')).toBe('حفظ');
  });

  it('t() falls back to key when missing', async () => {
    const { t } = await import('@/i18n');
    expect(t('nonexistent.key', 'fr')).toBe('nonexistent.key');
  });

  it('LANGUAGES has 3 languages', async () => {
    const { LANGUAGES } = await import('@/i18n');
    expect(LANGUAGES).toHaveLength(3);
  });

  it('getDir returns rtl for Arabic', async () => {
    const { getDir } = await import('@/i18n');
    expect(getDir('ar')).toBe('rtl');
    expect(getDir('fr')).toBe('ltr');
  });
});
