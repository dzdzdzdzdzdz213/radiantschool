import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, BookOpen, UserPlus, Clock, CreditCard, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const faqs = [
  { icon: UserPlus, question: 'Comment inscrire un élève ?', answer: 'Rendez-vous dans la section Inscriptions depuis le menu. Cliquez sur "Nouvelle inscription" et remplissez les informations de l\'élève.' },
  { icon: Clock, question: 'Comment fonctionnent les cours ?', answer: 'Les cours sont organisés par niveau (Primaire, CEM, Lycée). Vous pouvez consulter l\'offre sur la page Formations.' },
  { icon: CreditCard, question: 'Quels sont les moyens de paiement ?', answer: 'Les paiements s\'effectuent en DZD par espèce ou virement bancaire. Un reçu vous est remis à chaque règlement.' },
  { icon: FileText, question: 'Comment obtenir une facture ?', answer: 'Les factures sont disponibles dans votre espace personnel, rubrique Factures.' },
  { icon: Shield, question: 'La plateforme est-elle sécurisée ?', answer: 'Oui, toutes vos données sont hébergées de manière sécurisée et ne sont jamais partagées avec des tiers.' },
];

export default function PublicFaqPage() {

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--primary)' }}>
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-10">Foire aux questions</h1>

        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" /> Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div><p className="font-medium">Email</p><p>support@radiantlearning.dz</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div><p className="font-medium">Téléphone</p><p>+213 779 89 34 02</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <div><p className="font-medium">WhatsApp</p><p>+213 779 89 34 02</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BookOpen className="h-4 w-4" /> Questions fréquentes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-lg border border-border">
                <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-accent/50">
                  <faq.icon className="h-4 w-4 text-muted-foreground shrink-0" />
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
    </div>
  );
}
