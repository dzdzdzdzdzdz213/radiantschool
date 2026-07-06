import { Mail, Phone, MessageCircle, BookOpen, UserPlus, Clock, CreditCard, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLang } from '@/contexts/LangContext';
import { t } from '@/i18n';

const faqs = [
  {
    icon: UserPlus,
    question: 'Comment inscrire un élève ?',
    answer: 'Allez dans la section Inscriptions depuis le menu latéral. Cliquez sur "Nouvelle inscription" et remplissez les informations de l\'élève.',
  },
  {
    icon: Clock,
    question: 'Comment enregistrer une présence ?',
    answer: 'Utilisez la section Présences pour marquer les entrées. Vous pouvez scanner un badge RFID ou sélectionner manuellement l\'élève.',
  },
  {
    icon: CreditCard,
    question: 'Comment enregistrer un paiement ?',
    answer: 'Dans la section Paiements, cliquez sur "Nouveau paiement". Sélectionnez l\'élève, le montant et le mode de paiement.',
  },
  {
    icon: FileText,
    question: 'Comment générer une facture ?',
    answer: 'Allez dans Factures et cliquez sur "Créer une facture". Les factures sont automatiquement numérotées.',
  },
  {
    icon: Shield,
    question: 'Gestion des rôles et permissions',
    answer: 'Contactez l\'administrateur pour modifier les accès des utilisateurs.',
  },
];

export default function HelpPage() {
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('nav.help', lang)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Aide et support de la plateforme</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" />Contact</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
            <Mail className="h-4 w-4 text-muted" />
            <div><p className="font-medium">Email</p><p className="text-muted-foreground">support@radiantlearning.dz</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
            <Phone className="h-4 w-4 text-muted" />
            <div><p className="font-medium">{t('common.phone', lang)}</p><p className="text-muted-foreground">+213 5XX XX XX XX</p></div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
            <MessageCircle className="h-4 w-4 text-muted" />
            <div><p className="font-medium">WhatsApp</p><p className="text-muted-foreground">+213 5XX XX XX XX</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4" />FAQ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-lg border border-border">
              <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent/50">
                <faq.icon className="h-4 w-4 text-muted shrink-0" />
                <span>{faq.question}</span>
              </summary>
              <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                {faq.answer}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
