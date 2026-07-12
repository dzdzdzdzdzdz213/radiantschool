import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden active:scale-[0.95]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:shadow-[0_0_25px_var(--primary)] hover:-translate-y-1 hover:scale-[1.02]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:shadow-[0_0_25px_var(--destructive)] hover:-translate-y-1 hover:scale-[1.02]',
        outline:
          'border border-border bg-card hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/40 hover:bg-primary/5',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:-translate-y-1 hover:scale-[1.02]',
        ghost: 'hover:bg-accent/5 hover:text-accent-foreground hover:-translate-y-0.5',
        link: 'text-primary underline-offset-4 hover:underline hover:text-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-8 text-base',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
