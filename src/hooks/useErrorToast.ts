import { useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { t } from '@/i18n';
import type { Lang } from '@/i18n';

export function useErrorToast(isError: boolean, lang: Lang, pageName: string) {
  const { toast } = useToast();
  useEffect(() => {
    if (isError) toast(t('errors.load_error', lang, pageName), 'error');
  }, [isError, lang, pageName, toast]);
}
