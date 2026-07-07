import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PAGES: Record<string, { title: string; sections: { h2: string; p: string }[] }> = {
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      {
        h2: 'Éditeur du site',
        p: 'Radiant Academy — Centre de soutien scolaire et de formation. Enregistré sous le numéro RC : xxx / IF : xxx / NIF : xxx / AI : xxx. Siège social : Alger, Algérie.',
      },
      {
        h2: 'Directeur de la publication',
        p: 'La direction de Radiant Academy.',
      },
      {
        h2: 'Hébergement',
        p: 'Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis, et par Supabase Inc., 9701 Wilshire Blvd #800, Beverly Hills, CA 90212, États-Unis.',
      },
      {
        h2: 'Propriété intellectuelle',
        p: 'L\'ensemble des contenus présents sur ce site (textes, logos, images, vidéos) est la propriété exclusive de Radiant Academy. Toute reproduction ou utilisation sans autorisation est interdite.',
      },
    ],
  },
  cgv: {
    title: 'Conditions générales de vente',
    sections: [
      {
        h2: 'Objet',
        p: 'Les présentes conditions générales de vente régissent les prestations de soutien scolaire et de formation proposées par Radiant Academy aux élèves et à leurs représentants légaux.',
      },
      {
        h2: 'Inscription',
        p: 'L\'inscription est validée après remplissage du formulaire d\'adhésion et paiement des frais correspondants. Une confirmation est envoyée par email.',
      },
      {
        h2: 'Tarifs et paiement',
        p: 'Les tarifs sont indiqués en dinars algériens (DZD) toutes taxes comprises. Le paiement peut être effectué en espèces, par chèque bancaire, ou par virement.',
      },
      {
        h2: 'Annulation et remboursement',
        p: 'Toute annulation doit être notifiée au moins 48 heures à l\'avance. Les frais d\'inscription ne sont pas remboursables sauf cas de force majeure dûment justifié.',
      },
      {
        h2: 'Responsabilité',
        p: 'Radiant Academy s\'engage à fournir des prestations de qualité mais ne saurait être tenu responsable des résultats scolaires des élèves, ceux-ci dépendant de leur implication personnelle.',
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    sections: [
      {
        h2: 'Responsable du traitement',
        p: 'Le responsable du traitement des données est Radiant Academy, Alger, Algérie.',
      },
      {
        h2: 'Données collectées',
        p: 'Nous collectons les données suivantes : nom, prénom, adresse email, numéro de téléphone, niveau scolaire, et informations de paiement. Ces données sont nécessaires à la gestion des inscriptions et au suivi pédagogique.',
      },
      {
        h2: 'Finalités du traitement',
        p: 'Les données sont utilisées pour la gestion des comptes utilisateurs, le suivi des inscriptions et des paiements, la communication pédagogique (devoirs, annonces), et l\'amélioration de nos services.',
      },
      {
        h2: 'Durée de conservation',
        p: 'Les données sont conservées pendant toute la durée de la relation contractuelle et jusqu\'à 3 ans après la fin de celle-ci, sauf obligation légale contraire.',
      },
      {
        h2: 'Droits des utilisateurs',
        p: 'Conformément à la loi 18-07 relative à la protection des données à caractère personnel, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous via la page de contact.',
      },
      {
        h2: 'Sécurité',
        p: 'Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.',
      },
    ],
  },
};

export default function LegalPage() {
  const { page } = useParams<{ page: string }>();
  const content = page ? PAGES[page] : null;
  const valid = Object.keys(PAGES);

  if (!content) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8" style={{ backgroundColor: 'var(--bg)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>Page introuvable</h1>
        <Link to="/" className="text-sm" style={{ color: 'var(--primary)' }}>Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-10" style={{ color: 'var(--fg)' }}>{content.title}</h1>

        <div className="space-y-8">
          {content.sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--fg)' }}>{s.h2}</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}