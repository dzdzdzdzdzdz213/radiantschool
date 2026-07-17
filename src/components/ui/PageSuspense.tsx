import { Suspense, useState, useEffect, type ReactNode } from 'react';

function DelayedFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
