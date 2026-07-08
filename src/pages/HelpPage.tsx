import { Mail, Phone, MessageCircle, BookOpen, UserPlus, Clock, CreditCard, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

export default function HelpPage() {
  const { lang } = useLang();

  const faqs = [
    { icon: UserPlus, question: t('help.faq.q1', lang), answer: t('help.faq.a1', lang) },
    { icon: Clock, question: t('help.faq.q2', lang), answer: t('help.faq.a2', lang) },
    { icon: CreditCard, question: t('help.faq.q3', lang), answer: t('help.faq.a3', lang) },
    { icon: FileText, question: t('help.faq.q4', lang), answer: t('help.faq.a4', lang) },
    { icon: Shield, question: t('help.faq.q5', lang), answer: t('help.faq.a5', lang) },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('nav.help', lang)}</h1>
        <p className="mt-1 text-sm text-muted-foreground-foreground">{t('help.subtitle', lang)}</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" />{t('help.contact_section', lang)}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div><p className="font-medium">{t('help.email_label', lang)}</p><p className="text-muted-foreground-foreground">support@radiantlearning.dz</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div><p className="font-medium">{t('common.phone', lang)}</p><p className="text-muted-foreground-foreground">+213 5XX XX XX XX</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <div><p className="font-medium">{t('help.whatsapp_label', lang)}</p><p className="text-muted-foreground-foreground">+213 5XX XX XX XX</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4" />{t('help.faq_section', lang)}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-lg border border-border">
              <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent/50">
                <faq.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{faq.question}</span>
              </summary>
              <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
