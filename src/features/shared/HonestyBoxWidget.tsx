import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LangContext';
import { useToast } from '@/hooks/useToast';
import { t } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function HonestyBoxWidget() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (content.trim().length < 10) {
      toast(t('honesty.placeholder', lang), 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const submitRole = profile?.role === 'parent' ? 'parent' : 'student';
      const { error } = await supabase.rpc('honesty_submit', {
        p_role: submitRole,
        p_content: content.trim(),
      });
      if (error) {
        const msg = error.message;
        if (msg.includes('limit')) {
          toast(t('honesty.limit', lang), 'error');
        } else if (msg.includes('between')) {
          toast(t('honesty.placeholder', lang), 'warning');
        } else {
          toast(msg, 'error');
        }
        return;
      }
      setSent(true);
      setContent('');
      toast(t('honesty.submitted', lang), 'success');
    } catch {
      toast(t('common.error', lang), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
            </div>
            <h2 className="text-sm font-semibold">{t('honesty.title', lang)}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{t('honesty.subtitle', lang)}</p>

          {sent ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <ShieldCheck className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{t('honesty.submitted', lang)}</p>
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSent(false)}>
                {t('common.new', lang)}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('honesty.placeholder', lang)}
                maxLength={2000}
                rows={4}
                className="resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{content.length}/2000</span>
                <Button size="sm" onClick={handleSubmit} disabled={submitting || content.trim().length < 10}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t('honesty.submit', lang)}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
