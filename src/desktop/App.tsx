import { Suspense, useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LangProvider } from '@/contexts/LangContext';
import { ToastProvider } from '@/components/ui/Toast';
import { desktopRouter } from './router';
import { Loader, WifiOff } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    },
  },
});

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-0.5">
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
      />
    </div>
  );
}

function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] flex items-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <WifiOff className="h-4 w-4" />
      <span>Mode hors-ligne — les données affichées peuvent ne pas être à jour</span>
    </div>
  );
}

export default function DesktopApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <ToastProvider>
              <AnimatedBackground />
              <div className="app-root">
                <ScrollProgress />
                <OfflineBanner />
                <div className="content-wrapper">
                  <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                    <RouterProvider router={desktopRouter} />
                  </Suspense>
                </div>
              </div>
            </ToastProvider>
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
