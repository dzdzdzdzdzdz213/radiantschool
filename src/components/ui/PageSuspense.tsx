import { Suspense, useState, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';

function DelayedFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-b-pink-500/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Chargement...</p>
      </motion.div>
    </div>
  );
}

export default function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DelayedFallback />}>
      {children}
    </Suspense>
  );
}
