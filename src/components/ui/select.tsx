import { cn } from '@/lib/utils';
import { forwardRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

const SelectContext = { value: '', onValueChange: (v: string) => {}, open: false, setOpen: (o: boolean) => {} };

const SelectTrigger = forwardRef<HTMLButtonElement, { className?: string; children: React.ReactNode }>(
  ({ className, children }, ref) => (
    <button ref={ref} className={cn('flex h-9 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)}>
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  ),
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => null;

const SelectContent = forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
  ({ className, children }, ref) => <div ref={ref} className={cn('relative z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-md', className)}>{children}</div>,
);
SelectContent.displayName = 'SelectContent';

const SelectItem = forwardRef<HTMLButtonElement, SelectItemProps>(({ value, children }, ref) => (
  <button ref={ref} className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
    {children}
  </button>
));
SelectItem.displayName = 'SelectItem';

export function Select({ value, onValueChange, placeholder, children, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const triggerText = value ? children : placeholder;

  const items: any[] = [];
  let triggerLabel = placeholder ?? 'Sélectionner...';

  const processChildren = (child: any) => {
    if (!child) return;
    if (Array.isArray(child)) { child.forEach(processChildren); return; }
    if (child.type === SelectItem || child.type?.displayName === 'SelectItem') {
      const itemValue = child.props.value;
      items.push(child);
      if (itemValue === value) triggerLabel = child.props.children;
    }
    if (child.props?.children) processChildren(child.props.children);
  };
  processChildren(children);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={value ? '' : 'text-muted-foreground'}>{value ? triggerLabel : placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 z-50 w-full min-w-[8rem] rounded-xl border border-border bg-popover p-1 shadow-md">
            {(items.length > 0 ? items : React.Children.toArray(children)).map((item: any, idx: number) => (
              <button
                key={item.key ?? idx}
                className={`relative flex w-full cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-accent ${value === item.props.value ? 'bg-accent font-medium' : ''}`}
                onClick={() => { onValueChange(item.props.value); setOpen(false); }}
              >
                {item.props.children}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { SelectTrigger, SelectValue, SelectContent, SelectItem };