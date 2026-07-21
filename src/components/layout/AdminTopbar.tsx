import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, Sun, Moon, Globe, Search, User, Settings, HelpCircle, Loader, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LangContext';
import { getRoleLabel, getInitials } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/storage';
import { t, LANGUAGES } from '@/i18n';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

function NotificationSheet() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative rounded-xl p-2 hover:bg-sidebar-accent transition-colors">
          <Bell className="h-5 w-5 text-sidebar-fg/60" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('nav.notifications', lang)}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full pr-4 mt-4">
          <div className="space-y-3">
            {notifications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">{t('dashboard.no_notifications', lang)}</p>
            )}
            {notifications.map((n: any) => (
              <div key={n.id} className="rounded-xl bg-sidebar-accent p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                {n.created_at && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function UserMenu() {
  const { profile, signOut } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const role = profile?.role ?? 'admin';

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch {
      toast(t('errors.unknown', lang), 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-sidebar-accent transition-colors">
          <Avatar className="h-8 w-8">
            {profile?.photoUrl ? (
              <AvatarImage src={getAvatarUrl(profile.photoUrl) ?? undefined} />
            ) : null}
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(profile?.firstName ?? '', profile?.lastName ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-tight">{profile?.firstName} {profile?.lastName}</p>
            <p className="text-[10px] text-muted-foreground">{profile ? getRoleLabel(profile.role) : ''}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{profile?.firstName} {profile?.lastName}</span>
            <span className="text-xs font-normal text-muted-foreground">{profile?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>
          <User className="mr-2 h-4 w-4" />
          {t('nav.profile', lang)}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(role === 'teacher' ? `/${role}/profile` : `/${role}/settings`)}>
          <Settings className="mr-2 h-4 w-4" />
          {t('nav.settings', lang)}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/${profile?.role}/help`)}>
          <HelpCircle className="mr-2 h-4 w-4" />
          {t('nav.help', lang)}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-destructive focus:text-destructive"
        >
          {loggingOut ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {t('nav.logout', lang)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const role = profile?.role ?? 'admin';
    if (role !== 'assistant') return;
    navigate(`/${role}/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  useEffect(() => {
    const handleKbd = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('[data-search-input]')?.focus();
      }
    };
    document.addEventListener('keydown', handleKbd);
    return () => document.removeEventListener('keydown', handleKbd);
  }, []);

  return (
    <header className="relative">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-xl p-2 hover:bg-sidebar-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => navigate('/')}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-sidebar-fg/60 hover:bg-sidebar-accent hover:text-sidebar-fg transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Site
        </button>

        {profile?.role === 'assistant' && (
        <div className="hidden md:flex items-center">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-search-input
              placeholder={t('common.search', lang)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-xl bg-muted/30 pl-9 text-sm border-0 focus-visible:ring-1"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </form>
        </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 hover:bg-sidebar-accent transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-sidebar-fg/60" />
          ) : (
            <Moon className="h-5 w-5 text-sidebar-fg/60" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm font-medium hover:bg-sidebar-accent transition-colors text-sidebar-fg/60">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === lang)?.flag}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onClick={() => setLang(l.code as any)}
                className={lang === l.code ? 'bg-sidebar-accent font-medium' : ''}
              >
                <span className="mr-2">{l.flag}</span>
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationSheet />

        <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />

        <UserMenu />
      </div>
      </div>
    </header>
  );
}
