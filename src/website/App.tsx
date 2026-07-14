import { Suspense, useEffect, useRef, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LangProvider } from '@/contexts/LangContext';
import { ToastProvider } from '@/components/ui/Toast';
import { router } from '@/website/router';
import { Loader } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
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

function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = parseInt(el.getAttribute('data-reveal-delay') || '0');
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add('revealed');
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <ToastProvider>
              <AnimatedBackground />
              <div className="app-root">
                <ScrollProgress />
                <ScrollReveal />
                <div className="content-wrapper">
                  <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                    <RouterProvider router={router} />
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
