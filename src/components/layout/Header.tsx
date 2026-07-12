import { Menu, Bell, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';
import { useNavigate } from 'react-router-dom';
import { getFullName } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/storage';
import { LANGUAGES, t } from '@/i18n';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const avatarUrl = getAvatarUrl(profile?.photoUrl);

  return (
    <header className="glass-header flex h-16 items-center justify-between px-4 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors">
        <Menu className="h-5 w-5" style={{ color: 'var(--fg-muted)' }} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 transition-all duration-200 hover:bg-white/10 active:scale-95"
          title={theme === 'dark' ? t('common.light_mode', lang) : t('common.dark_mode', lang)}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} /> : <Moon className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/10 active:scale-95"
            style={{ color: 'var(--fg-muted)' }}
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-semibold">{LANGUAGES.find(l => l.code === lang)?.label}</span>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border shadow-xl animate-scale" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-primary/5"
                    style={{ color: lang === l.code ? 'var(--primary)' : 'var(--fg)', backgroundColor: lang === l.code ? 'var(--primary-light)' : 'transparent', fontWeight: lang === l.code ? 600 : 400 }}
                  >
                    <span className="text-base">{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button onClick={() => navigate('/notifications')} className="relative rounded-xl p-2.5 transition-all duration-200 hover:bg-white/10 active:scale-95">
          <Bell className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
        </button>

        <div className="flex items-center gap-3 pl-2 ml-2" style={{ borderLeft: '1px solid var(--border)' }}>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{getFullName(profile?.firstName || '', profile?.lastName || '')}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>{profile ? t('role.' + profile.role, lang) : ''}</p>
          </div>
          {avatarUrl ? (
            <img src={avatarUrl} alt={getFullName(profile?.firstName || '', profile?.lastName || '')} className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs font-bold shadow-md">
              {profile ? (profile.firstName?.charAt(0)?.toUpperCase() ?? '') + (profile.lastName?.charAt(0)?.toUpperCase() ?? '') : '?'}
            </div>
          )}
        </div>
        <button onClick={handleLogout} className="rounded-xl p-2.5 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-95">
          <LogOut className="h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
        </button>
      </div>
    </header>
  );
}
