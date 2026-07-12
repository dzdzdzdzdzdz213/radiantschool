import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-md', className)}
      style={{
        background: `linear-gradient(90deg, var(--muted) 25%, color-mix(in srgb, var(--muted) 50%, var(--primary)) 50%, var(--muted) 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
      {...props}
    />
  );
}

export { Skeleton };
