import type { ReactNode } from 'react';
import { asset } from '@/lib/assets';
import { cn } from '@/lib/utils';

export default function PhotoBackdrop({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-border', className)}>
      <img
        src={asset('alex-hero.jpg')}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}