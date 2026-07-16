import { Suspense, type ReactNode } from 'react';

export default function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      {children}
    </Suspense>
  );
}
