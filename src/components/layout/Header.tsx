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
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden">
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 transition-colors hover-bg-page"
          title={theme === 'dark' ? t('common.light_mode', lang) : t('common.dark_mode', lang)}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover-bg-page"
            style={{ color: 'var(--fg-muted)' }}
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === lang)?.label}</span>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border py-1 shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${lang === l.code ? 'font-medium' : ''}`}
                    style={{ color: lang === l.code ? 'var(--primary)' : 'var(--fg)', backgroundColor: lang === l.code ? 'var(--primary-light)' : 'transparent' }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button onClick={() => navigate('/notifications')} className="relative rounded-full p-2 hover-bg-page">
          <Bell className="h-5 w-5 text-muted-foreground" />

        </button>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium">{profile?.firstName} {profile?.lastName}</p>
            <p className="text-xs text-muted-foreground">{profile ? t('role.' + profile.role, lang) : ''}</p>
          </div>
          {avatarUrl ? (
            <img src={avatarUrl} alt={getFullName(profile?.firstName || '', profile?.lastName || '')} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
              {profile ? (profile.firstName?.charAt(0)?.toUpperCase() ?? '') + (profile.lastName?.charAt(0)?.toUpperCase() ?? '') : '?'}
            </div>
          )}
        </div>
        <button onClick={handleLogout} className="rounded-full p-2 hover-bg-page">
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
