import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import { t } from '@/i18n';
import type { Lang } from '@/i18n';

export function useErrorToast(isError: boolean, lang: Lang, pageName: string) {
  const { toast } = useToast();
  const shownRef = useRef(false);
  useEffect(() => {
    if (isError && !shownRef.current) {
      shownRef.current = true;
      toast(t('errors.load_error', lang, pageName), 'error');
    } else if (!isError) {
      shownRef.current = false;
    }
  }, [isError, lang, pageName, toast]);
}
