import { Button } from '@/components/ui/button';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  loading?: boolean;
  confirmLabel?: string;
  variant?: 'destructive' | 'default' | 'success';
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, confirmLabel, variant = 'destructive' }: ConfirmDialogProps) {
  const { lang } = useLang();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative bg-card rounded-xl p-6 w-full max-w-sm mx-4 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-base font-semibold">{title ?? t('common.confirm', lang)}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" className="h-9" onClick={onClose} disabled={loading}>{t('common.cancel', lang)}</Button>
          <Button variant={variant === 'success' ? 'default' : variant} size="sm" className="h-9" onClick={onConfirm} disabled={loading}>
            {loading ? t('common.loading', lang) : confirmLabel ?? t('common.confirm', lang)}
          </Button>
        </div>
      </div>
    </div>
  );
}
