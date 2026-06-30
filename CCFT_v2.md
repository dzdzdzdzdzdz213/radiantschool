# Cahier des Charges Fonctionnel et Technique

## Plateforme ERP de Gestion de Centre de Soutien Scolaire

---

**Référence :** CCDT-ERP-SCOL-002  
**Version :** 2.0  
**Date :** Juin 2026  
**Statut :** Version Finale  
**Classification :** Confidentiel  

---

**Client :** [Nom du Centre de Soutien Scolaire]  
**Prestataire :** [Nom de la Société de Développement]  

---

# Table des Matières

1. Introduction et Contexte
2. Présentation du Projet
3. Objectifs et Périmètre
4. Parties Prenantes
5. Exigences Fonctionnelles
6. Cas d'Utilisation
7. Règles de Gestion
8. Exigences Non Fonctionnelles
9. Architecture Technique
10. Base de Données
11. Spécification de l'API
12. Sécurité
13. Interface Utilisateur
14. Tests et Qualité
15. Déploiement et Maintenance
16. Annexes

---

# 1. Introduction et Contexte

## 1.1 Objet du Document

Le présent document constitue le Cahier des Charges Fonctionnel et Technique (CCFT) pour la conception, le développement et le déploiement d'une plateforme ERP web dédiée à la gestion d'un centre de soutien scolaire privé en Algérie.

Ce document sert de référence contractuelle et technique entre le client (le centre de soutien scolaire) et le prestataire de développement. Toute modification du périmètre défini dans ce document doit faire l'objet d'un avenant signé par les deux parties.

## 1.2 Contexte du Secteur

Le secteur du soutien scolaire en Algérie connaît une croissance significative. Les examens nationaux (BEM, Baccalauréat) génèrent une demande importante de cours de soutien. Les centres privés se multiplient dans les grandes villes (Alger, Oran, Constantine, Annaba) et s'étendent aux villes secondaires.

Les méthodes de gestion traditionnelles (fiches papier, registres manuscrits, tableurs Excel) ne permettent plus de faire face au volume croissant d'élèves et à la complexité des opérations quotidiennes.

## 1.3 Problématique

Le centre ne dispose pas d'un système d'information intégré. Les données sont dispersées, les processus manuels sont chronophages, et la direction manque de visibilité en temps réel. Les parents n'ont pas de transparence sur la présence et les paiements de leurs enfants. Les enseignants ne disposent pas d'outils pour gérer efficacement leurs cours et ressources.

---

# 2. Présentation du Projet

## 2.1 Fiche d'Identité

| Champ | Valeur |
|-------|--------|
| Nom du Projet | [À définir] |
| Type | ERP Web — Gestion de Centre de Soutien Scolaire |
| Secteur | Éducation et Soutien Scolaire |
| Durée Estimée | 8 à 12 mois |
| Budget | [À définir] |

## 2.2 Utilisateurs

| Rôle | Effectif Estimé | Description |
|------|-----------------|-------------|
| Administrateur | 1-3 | Super-utilisateur : gère tout le système, les utilisateurs, les paramètres, les rapports |
| Assistant | 2-8 | Gère les inscriptions, paiements, présences, communication avec parents et enseignants |
| Enseignant | 10-50 | Anime les cours, upload les ressources pédagogiques, consulte son planning et ses revenus |
| Élève | 100-2000 | S'inscrit aux cours, consulte son planning et ses factures, télécharge les ressources, évalue les enseignants |
| Parent | 200-3000 | Consulte les informations de ses enfants, approuve les cours particuliers, suit les présences |

## 2.3 Types de Cours

| Type | Capacité | Description |
|------|----------|-------------|
| Normal | 30 élèves max | Cours collectif standard dans une salle |
| VIP | 6 élèves max | Groupe réduit, suivi personnalisé |
| Particulier | 1 ou 2 élèves | Cours individuel ou en binôme (approbation parent+enseignant requise pour le binôme) |

## 2.4 Niveaux Scolaires

| Catégorie | Années / Filières |
|-----------|------------------|
| Primaire | 1AP à 5AP |
| Collège (Moyen) | 1AM à 4AM |
| 1AS | Scientifique, Lettres |
| 2AS | Mathématiques, Maths techniques, Génie mécanique, Génie électrique, Génie des procédés |
| 3AS | Baccalauréat — toutes filières |

---

# 3. Objectifs et Périmètre

## 3.1 Objectifs Stratégiques

| ID | Objectif | Description |
|----|----------|-------------|
| OS-01 | Centralisation | Référentiel unique de toutes les données du centre |
| OS-02 | Automatisation | Inscriptions, facturation, relances, notifications |
| OS-03 | Transparence | Visibilité parentale en temps réel sur la scolarité |
| OS-04 | Outillage enseignant | Gestion des cours, ressources, planning |
| OS-05 | Pilotage | KPIs en temps réel pour la direction |
| OS-06 | Sécurité | Confidentialité et intégrité des données |
| OS-07 | Scalabilité | Croissance sans refonte architecturale |

## 3.2 Modules Fonctionnels

| Module | Description | Priorité |
|--------|-------------|----------|
| M01 | Authentification et gestion des comptes | Critique |
| M02 | Profils utilisateurs | Critique |
| M03 | Inscriptions et campagnes | Critique |
| M04 | Cours et planification intelligente | Critique |
| M05 | Présences RFID | Critique |
| M06 | Gestion financière (paiements, factures, avoirs) | Critique |
| M07 | Ressources pédagogiques | Haute |
| M08 | Communication (messagerie, notifications) | Haute |
| M09 | Évaluations et classements | Haute |
| M10 | Tableau de bord et KPIs | Haute |
| M11 | Rapports PDF/Excel | Moyenne |
| M12 | Administration et configuration | Critique |

## 3.3 Hors Périmètre V1

- Bulletins scolaires et notes officielles
- Examens officiels (BEM, BAC)
- Visioconférence intégrée
- Application mobile native
- Comptabilité générale (bilan, liasse fiscale)
- Recrutement d'enseignants
- Site vitrine du centre

---

# 4. Parties Prenantes

## 4.1 Comité de Pilotage

| Rôle | Responsabilité | Fréquence |
|------|---------------|-----------|
| Direction du centre | Décisions stratégiques, budget, recette | Mensuel |
| Chef de projet MOA | Expression des besoins, validation | Mensuel |
| Chef de projet MOE | Coordination technique, livraison | Mensuel |

## 4.2 Équipe de Réalisation

| Rôle | Effectif | Missions |
|------|----------|----------|
| Chef de projet MOE | 1 | Planification, coordination, reporting |
| Architecte logiciel | 1 | Conception, choix technologiques |
| Lead développeur backend | 1 | API, base de données, architecture |
| Lead développeur frontend | 1 | Interfaces, composants, UX |
| Développeurs full-stack | 2-3 | Développement des modules |
| Designer UX/UI | 1 | Maquettes, charte graphique |
| Testeur QA | 1 | Tests fonctionnels, automatisation |
| DevOps | 1 | CI/CD, déploiement, monitoring |

---

# 5. Exigences Fonctionnelles

## 5.1 Module Authentification (M01)

| Réf | Exigence | Règle métier | Priorité |
|-----|----------|-------------|----------|
| EX-AUTH-01 | Création de compte avec email, mot de passe, nom, prénom, téléphone | Mot de passe ≥ 8 car. avec maj, min, chiffre, spécial | Critique |
| EX-AUTH-02 | Envoi d'un email de vérification avec lien valable 24h | Token à usage unique | Critique |
| EX-AUTH-03 | Choix du type d'élève (Régulier / Session unique) | Type définitif après la 1re inscription | Critique |
| EX-AUTH-04 | Comptes enseignants/assistants créés avec statut PENDING | Approuvés par admin avant accès | Critique |
| EX-AUTH-05 | Réinitialisation de mot de passe via email | Token unique, expire 1h | Haute |
| EX-AUTH-06 | Suspension/suppression de compte par admin | Soft delete (deleted_at) | Critique |
| EX-AUTH-07 | Connexion avec JWT (15 min) + Refresh token (7 jours) | Blacklist Redis pour révocation | Critique |

## 5.2 Module Profils (M02)

| Réf | Exigence | Contrainte | Priorité |
|-----|----------|------------|----------|
| EX-PROF-01 | L'élève complète son profil : niveau scolaire, photo, école | Niveau scolaire obligatoire | Haute |
| EX-PROF-02 | L'élève renseigne 1 à 3 parents (nom, email, téléphone, lien) | Au moins 1 parent requis | Critique |
| EX-PROF-03 | L'enseignant renseigne spécialités, mode (online/onsite/both), disponibilités | Créneaux hebdomadaires récurrents | Critique |
| EX-PROF-04 | Le parent crée son compte via un code de liaison unique | Code généré et envoyé par email | Haute |

## 5.3 Module Inscriptions (M03)

| Réf | Exigence | Règle métier | Priorité |
|-----|----------|-------------|----------|
| EX-INSC-01 | Wizard d'inscription en 4 étapes | 1:Type+Infos, 2:Niveau+Matières, 3:Choix cours, 4:Récap+Confirmation | Critique |
| EX-INSC-02 | Affichage des matières disponibles par niveau | Configuré par admin via level_subject | Critique |
| EX-INSC-03 | Cours filtrables par type, jour, horaire | Vérification conflits automatique | Critique |
| EX-INSC-04 | Proposition d'alternatives si cours complet | Inscription en liste d'attente possible | Haute |
| EX-INSC-05 | Approbation parent+enseignant pour cours particulier 2 élèves | Timeout 48h, annulation auto | Critique |
| EX-INSC-06 | Campagnes avec date début/fin, activation automatique | Cours et prix associés | Critique |
| EX-INSC-07 | Workflow de désinscription avec motif, préavis, remboursement prorata | Approbation assistant requise | Haute |

## 5.4 Module Cours et Planification (M04)

| Réf | Exigence | Règle métier | Priorité |
|-----|----------|-------------|----------|
| EX-COUR-01 | Création avec type, matière, niveau, enseignant, salle, capacité, prix, horaires, période | Vérification conflits automatique | Critique |
| EX-COUR-02 | Contrainte d'exclusion PostgreSQL pour conflits enseignant et salle | Garantie base de données | Critique |
| EX-COUR-03 | Vérification atomique de la capacité (SELECT FOR UPDATE) | Évite les sur-inscriptions | Critique |
| EX-COUR-04 | Calendrier visuel par rôle avec vue semaine | Navigation, filtres | Haute |
| EX-COUR-05 | Workflow d'absence enseignant avec recherche de remplaçant | Notification élèves automatique | Haute |
| EX-COUR-06 | Calendrier académique : jours fériés, vacances, événements | Blocage des planifications | Haute |

## 5.5 Module Présences RFID (M05)

| Réf | Exigence | Règle métier | Priorité |
|-----|----------|-------------|----------|
| EX-RFID-01 | Association d'une carte RFID unique à chaque élève | rfid_tag unique, statut (ACTIVE/INACTIVE/LOST) | Critique |
| EX-RFID-02 | Vérifications automatiques au scan : carte active, profil complet, paiement à jour, inscription active | Paiement en retard = alerte + présence acceptée | Critique |
| EX-RFID-03 | Mode manuel de secours par l'assistant | Journalisé dans audit_logs | Haute |
| EX-RFID-04 | Mise à jour dashboard en temps réel via WebSocket | Latence ≤ 3 secondes | Haute |

## 5.6 Module Financier (M06)

| Réf | Exigence | Règle métier | Priorité |
|-----|----------|-------------|----------|
| EX-FIN-01 | Enregistrement des paiements : montant, méthode, type, référence | Numéro de reçu auto-généré REC-AAAA-XXXXX | Critique |
| EX-FIN-02 | Factures mensuelles générées automatiquement le 1er du mois | Génération asynchrone (Bull queue) | Critique |
| EX-FIN-03 | Reçus PDF générés de manière asynchrone | Notification quand prêt | Critique |
| EX-FIN-04 | Séquence de relance configurable : J+5, J+15, J+30 | Paramétrable par admin | Haute |
| EX-FIN-05 | Gestion des avoirs/crédits : excédent = crédit sur prochaine facture | Automatique | Haute |
| EX-FIN-06 | Calcul des revenus enseignants selon contrat (fixe/horaire/pourcentage) | Taux configurables | Haute |

## 5.7 Module Ressources (M07)

| Réf | Exigence | Contrainte | Priorité |
|-----|----------|------------|----------|
| EX-RESS-01 | Upload PDF, DOCX, XLSX, PNG, JPG, MP4, WebM | 50 Mo documents, 200 Mo vidéos | Critique |
| EX-RESS-02 | Upload direct vers S3/MinIO via URL pré-signée | Serveur ne voit pas le fichier | Critique |
| EX-RESS-03 | Validation des magic bytes et type MIME côté serveur | Bloque les exécutables | Critique |
| EX-RESS-04 | Organisation par cours et par séance | Dossiers/sections par l'enseignant | Haute |

## 5.8 Module Communication (M08)

| Réf | Exigence | Règle métier | Priorité |
|-----|----------|-------------|----------|
| EX-COM-01 | Messagerie : parent↔assistant, enseignant↔assistant, admin↔tous | Conservation 2 ans, puis purge | Haute |
| EX-COM-02 | Communication élève↔enseignant avec copie parent | Supervision parentale | Moyenne |
| EX-COM-03 | Notifications email + système | Critiques toujours par email | Critique |
| EX-COM-04 | Notifications asynchrones via Bull queue | Réponse HTTP immédiate | Critique |

## 5.9 Module Évaluations (M09)

| Réf | Exigence | Règle métier | Priorité |
|-----|----------|-------------|----------|
| EX-EVAL-01 | Évaluation 1-5 étoiles : qualité, communication, ponctualité, organisation | Après au moins 1 présence | Haute |
| EX-EVAL-02 | Note moyenne calculée automatiquement (colonne GENERATED) | Stockée en base | Haute |
| EX-EVAL-03 | Leaderboard mis à jour automatiquement | Public pour les élèves | Haute |
| EX-EVAL-04 | Anonymat des évaluations (enseignant ne voit pas l'élève) | Jointure admin uniquement | Haute |

## 5.10 Module Dashboard (M10)

| Réf | Exigence | Règle métier | Priorité |
|-----|----------|-------------|----------|
| EX-DASH-01 | KPIs admin : revenu, élèves actifs, taux occupation, nouveaux inscrits | Vues matérialisées + cache Redis 5 min | Critique |
| EX-DASH-02 | Graphiques : courbe revenus, camembert présences, barres croissance | Cache Redis 5 min | Haute |
| EX-DASH-03 | Sélecteur de période pour données historiques | Vues matérialisées historisées | Haute |
| EX-DASH-04 | Dashboard enseignant : planning, revenu, évaluations | Temps réel | Haute |
| EX-DASH-05 | Dashboard assistant : présences jour, inscriptions, paiements | Rafraîchi 30s | Haute |
| EX-DASH-06 | Dashboard parent : présences enfants, factures, notifications | Multi-enfants | Haute |

## 5.11 Module Rapports (M11)

| Réf | Exigence | Format | Priorité |
|-----|----------|--------|----------|
| EX-RAPP-01 | Rapport financier : revenus par période/matière/niveau/enseignant | PDF + Excel | Haute |
| EX-RAPP-02 | Rapport fréquentation : présence par cours/élève/période | PDF + Excel | Haute |
| EX-RAPP-03 | Rapport impayés : élèves en retard, montants, durée | PDF + Excel | Haute |
| EX-RAPP-04 | Rapport enseignants : cours, évaluations, revenus | PDF + Excel | Haute |
| EX-RAPP-05 | Tous les rapports filtrables par période, génération asynchrone | Export PDF/Excel | Haute |

## 5.12 Module Administration (M12)

| Réf | Exigence | Priorité |
|-----|----------|----------|
| EX-ADMIN-01 | CRUD utilisateurs avec soft delete (deleted_at) | Critique |
| EX-ADMIN-02 | Configuration : nom centre, devise DZD, langue, fuseau Africa/Algiers | Critique |
| EX-ADMIN-03 | Permissions granulaires (ressource:action) par rôle modifiable | Critique |
| EX-ADMIN-04 | Consultation et export des journaux d'audit (filtres utilisateur/action/date) | Critique |
| EX-ADMIN-05 | Sauvegardes automatiques quotidiennes + manuelles, rétention 30 jours | Critique |
| EX-ADMIN-06 | Gestion niveaux, matières, associations niveau-matière | Critique |
| EX-ADMIN-07 | Gestion salles : nom, capacité, équipement, étage, statut | Haute |
| EX-ADMIN-08 | Configuration séquence de relance (délais, actions) | Haute |

---

# 6. Cas d'Utilisation

## 6.1 Acteurs

| Acteur | Description |
|--------|-------------|
| Visiteur | Non authentifié — inscription, connexion |
| Élève | Compte vérifié — inscription cours, consultation, téléchargement, évaluation |
| Parent | Lié à 1+ élèves — consultation, approbation, paiement |
| Enseignant | Compte approuvé — gestion cours, ressources, évaluations |
| Assistant | Compte créé par admin — inscriptions, paiements, présences |
| Administrateur | Super-utilisateur — tout gérer, configurer, auditer |
| Système RFID | Acteur système — envoi des données de scan |

## 6.2 UC-01 : Inscription d'un élève

**Acteur :** Visiteur → Élève  
**Précondition :** Aucune  
**Postcondition :** Compte créé, email vérifié, profil partiellement complété  
**Flux :** Type inscription → Infos personnelles → Vérification email → Niveau/matières → Choix cours → Confirmation  

**Scénario alternatif :** Cours complet → Proposition alternatives ou liste d'attente

## 6.3 UC-02 : Scan RFID

**Acteur :** Système RFID  
**Précondition :** Carte RFID active liée à un élève  
**Postcondition :** Présence enregistrée + dashboard mis à jour  
**Vérifications (ordre) :** Carte active ? Profil complet ? Paiement à jour ? Inscription active ?  
**Alertes :** Paiement retard = avertissement. Profil incomplet ou carte inactive = bloquant

## 6.4 UC-03 : Paiement

**Acteur :** Assistant  
**Précondition :** Élève inscrit à un cours  
**Postcondition :** Paiement enregistré, reçu PDF généré (asynchrone), notification envoyée  
**Flux :** Recherche élève → Saisie montant/méthode → Validation → Enregistrement → Notification

## 6.5 UC-04 : Création d'un cours

**Acteur :** Administrateur / Assistant  
**Précondition :** Enseignant et salle disponibles  
**Postcondition :** Cours créé, conflits vérifiés  
**Contrainte :** Exclusion gist PostgreSQL pour conflits enseignant et salle

---

# 7. Règles de Gestion

| ID | Règle | Contrôle | Sanction |
|----|-------|----------|----------|
| RG-01 | Normal ≤ 30, VIP ≤ 6, Particulier ≤ 2 | SELECT FOR UPDATE | Refus d'inscription |
| RG-02 | Conflit enseignant interdit | Contrainte exclusion PostgreSQL | Refus + suggestions |
| RG-03 | Conflit salle interdit | Contrainte exclusion PostgreSQL | Refus + alternatives |
| RG-04 | Conflit élève interdit | Vérification applicative | Refus + créneaux alternatifs |
| RG-05 | Comptes enseignant/assistant en attente d'approbation admin | Statut PENDING | Accès refusé |
| RG-06 | Email obligatoire avant accès fonctionnalités | Token 24h | Fonctionnalités bloquées |
| RG-07 | Cours particulier 2 élèves : approbation parent + enseignant | Timeout 48h | Annulation automatique |
| RG-08 | Paiement mensuel dû avant le 10 | Scan RFID | Avertissement J+10, suspension J+30 |
| RG-09 | Séquence relance : J+5 email, J+15 email+SMS, J+30 suspension | Cron | Actions automatiques |
| RG-10 | Évaluations anonymes pour l'enseignant | Jointure admin uniquement | — |
| RG-11 | Désinscription avec motif + remboursement prorata | Approbation assistant | Remboursement sous 14 jours |
| RG-12 | Données financières conservées 10 ans | Backup archivé | Purge impossible |

---

# 8. Exigences Non Fonctionnelles

## 8.1 Performance

| Métrique | Cible |
|----------|-------|
| Temps réponse API (p95) | ≤ 500 ms |
| Temps chargement pages | ≤ 2 s |
| Génération PDF | ≤ 5 s (asynchrone) |
| Montée en charge | 500 utilisateurs simultanés |
| Synchronisation RFID | ≤ 3 s |

## 8.2 Disponibilité

| Métrique | Cible |
|----------|-------|
| Uptime | ≥ 99,5 % |
| RTO (reprise) | ≤ 4 h |
| RPO (perte max) | ≤ 15 min |
| Maintenance | 4 h/mois max |

## 8.3 Sécurité

| Mesure | Détail |
|--------|--------|
| Authentification | JWT (15 min) + Refresh token (7 jours) + Blacklist Redis |
| Chiffrement au repos | AES-256 via pgcrypto (colonnes sensibles) |
| Chiffrement transit | TLS 1.3 |
| Hash mots de passe | bcrypt (coût 12) ou argon2 |
| 2FA | Obligatoire pour administrateurs |
| Rate limiting | 5 req/min/auth, 100 req/min/api |
| Révocation session | Blacklist Redis |
| CSP | Content Security Policy stricte |
| Upload validation | Magic bytes + MIME check |

## 8.4 Stack Technologique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Frontend | Next.js 14 + React 18 + TypeScript | SSR, Server Components, écosystème |
| Backend | NestJS 10 + TypeScript | Modulaire, injection dépendances |
| Base données | PostgreSQL 16 | Types avancés, exclusion constraints |
| Cache/Queue | Redis 7 | Cache + Bull queue + blacklist |
| Stockage | MinIO / S3 | Upload direct, scalable |
| Conteneurs | Docker + Docker Compose | Standard industriel |
| Monitoring | Prometheus + Grafana + Sentry | Open source |
| Temps réel | WebSocket (Socket.io) | Chat, dashboard |

---

# 9. Architecture Technique

## 9.1 Vue d'Ensemble

```
                    [CDN — Cloudflare]
                          |
                    [Load Balancer]
                          |
          ┌───────────────┼───────────────┐
          |               |               |
     [Next.js]       [Next.js]       [Next.js]
    (App Server)   (App Server)   (App Server)
          |               |               |
          └───────────────┼───────────────┘
                          |
                    [API Gateway]
                          |
          ┌───────────────┼───────────────┐
          |               |               |
     [NestJS API]   [NestJS API]   [NestJS API]
    (stateless)    (stateless)    (stateless)
          |               |               |
          ├───────────────┼───────────────┤
          |               |               |
      [PostgreSQL]    [Redis]        [MinIO/S3]
    (Primary+Replica) (Cache+Queue) (Object Storage)
          |               |
    [pg_cron]       [Bull Workers]
    (backups)       (emails, PDF)
```

## 9.2 Flux Asynchrones

Les opérations non critiques pour la réponse HTTP utilisent Bull queue :

| Opération | Queue | Notification |
|-----------|-------|--------------|
| Envoi email | Bull | Webhook confirmation |
| Génération PDF | Bull | Notification quand prêt |
| Facturation mensuelle | Cron (pg_cron) | Notification admin |
| Relances impayés | Cron (pg_cron) | Email automatique |
| Sauvegarde BD | Cron (pg_cron) | Notification admin |
| Rafraîchissement vues matérialisées | Cron (pg_cron) | — |

## 9.3 Cache Redis

| Donnée | TTL | Invalidation |
|--------|-----|--------------|
| KPIs dashboard | 5 min | Invalidation manuelle |
| Niveaux/matières | 1 h | Modification admin |
| Profils utilisateurs | 15 min | Modification profil |
| Cours disponibles | 5 min | Inscription/désinscription |
| Leaderboard | 1 h | Nouvelle évaluation |
| Blacklist tokens | TTL du token | Révocation |

---

# 10. Base de Données

## 10.1 Choix du SGBD

PostgreSQL 16 avec extensions : pgcrypto, btree_gist, pg_cron.

## 10.2 Tables Principales

| Table | Description |
|-------|-------------|
| users | Comptes utilisateurs (tous rôles) avec soft delete (deleted_at) |
| students | Spécificités élèves : type, matricule, RFID, école |
| parents | Comptes parents |
| student_parent | Association élève-parent avec lien de parenté |
| teachers | Spécificités enseignants : mode, spécialités, note |
| assistants | Comptes assistants |
| teacher_contracts | Contrats : type, taux, heures min/max, période |
| teacher_availability | Créneaux de disponibilité hebdomadaires |
| levels | Niveaux scolaires avec catégorie et filière |
| subjects | Matières |
| level_subject | Association niveau-matière |
| rooms | Salles : nom, capacité, équipement, statut |
| courses | Cours : type, capacité, prix, période, enseignant, salle |
| course_schedules | Séances avec contrainte d'exclusion pour conflits |
| course_enrollments | Inscriptions avec statut (PENDING_APPROVAL) |
| attendance | Présences : méthode (RFID/manual), statut |
| payments | Paiements : montant, méthode, type, reçu |
| transactions | Transactions financières (paiement, crédit, refund) |
| invoices | Factures : numéro, montant, statut, PDF URL |
| resources | Ressources pédagogiques : type, URL, taille |
| evaluations | Évaluations : 4 critères + moyenne calculée |
| notifications | Notifications : type, catégorie, lu/non lu |
| messages | Messagerie interne |
| campaigns | Campagnes d'inscription |
| waiting_list | Listes d'attente |
| approvals | Approbations polymorphes (cours particuliers) |
| audit_logs | Journal d'audit de toutes les actions sensibles |
| backups | Historique des sauvegardes |

## 10.3 Contraintes d'Exclusion

```sql
ALTER TABLE course_schedules ADD CONSTRAINT no_teacher_conflict
EXCLUDE USING gist (
    teacher_id WITH =,
    day_of_week WITH =,
    tstzrange('2000-01-01'::date + start_time, '2000-01-01'::date + end_time, '[)') WITH &&
);

ALTER TABLE course_schedules ADD CONSTRAINT no_room_conflict
EXCLUDE USING gist (
    room_id WITH =,
    day_of_week WITH =,
    tstzrange('2000-01-01'::date + start_time, '2000-01-01'::date + end_time, '[)') WITH &&
);
```

## 10.4 Index

```sql
CREATE INDEX idx_enrollments_student_status ON course_enrollments(student_id, status);
CREATE INDEX idx_payments_student_date ON payments(student_id, payment_date DESC);
CREATE INDEX idx_invoices_student_status ON invoices(student_id, status);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_users_search ON users USING GIN (
    to_tsvector('french', coalesce(first_name,'')||' '||coalesce(last_name,'')||' '||coalesce(email,''))
);
```

---

# 11. Spécification de l'API

## 11.1 Standards

| Élément | Valeur |
|---------|--------|
| Base URL | /api/v1/ |
| Format | JSON |
| Auth | Bearer JWT |
| Pagination | { data, meta: { page, limit, total, totalPages } } |
| Pagination défaut | 20, max 100 |
| Tri | ?sort=created_at:desc |
| Filtres | ?status=ACTIVE&type=REGULAR |
| Recherche | ?search=texte (full-text) |
| Idempotence | Header Idempotency-Key sur POST |

## 11.2 Endpoints Principaux

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| POST | /api/v1/auth/register | Public |
| POST | /api/v1/auth/login | Public |
| GET | /api/v1/users | ADMIN |
| GET | /api/v1/users/pending | ADMIN |
| PUT | /api/v1/users/:id/approve | ADMIN |
| PUT | /api/v1/users/:id/suspend | ADMIN |
| GET | /api/v1/courses | Tous |
| POST | /api/v1/courses | ADMIN, ASSISTANT |
| POST | /api/v1/courses/:id/enroll | STUDENT |
| GET | /api/v1/courses/available | STUDENT |
| POST | /api/v1/schedules/check-conflicts | ADMIN, ASSISTANT |
| POST | /api/v1/attendance/scan | RFID, ASSISTANT |
| POST | /api/v1/attendance/manual | ASSISTANT |
| POST | /api/v1/payments | ADMIN, ASSISTANT |
| GET | /api/v1/invoices/student/:id | STUDENT, PARENT |
| POST | /api/v1/resources | TEACHER |
| GET | /api/v1/leaderboard | Tous |
| GET | /api/v1/dashboard | ADMIN |
| GET | /api/v1/dashboard/teacher | TEACHER |
| GET | /api/v1/dashboard/assistant | ASSISTANT |
| GET | /api/v1/dashboard/parent | PARENT |
| GET | /api/v1/reports/financial | ADMIN |
| GET | /api/v1/audit-logs | ADMIN |
| POST | /api/v1/backups | ADMIN |
| GET | /api/v1/settings | ADMIN |
| PUT | /api/v1/settings | ADMIN |

---

# 12. Sécurité

## 12.1 Authentification

- JWT Access Token : 15 min
- Refresh Token : 7 jours (stocké base)
- Blacklist Redis des tokens révoqués
- 2FA TOTP obligatoire pour ADMIN
- Rate limiting auth : 5 req/min/IP
- Lockout : 10 échecs → 30 min

## 12.2 Autorisation (RBAC)

Permissions granulaires par ressource:action. Chaque rôle est un ensemble de permissions modifiable par l'admin.

| Rôle | Permissions par défaut |
|------|----------------------|
| ADMIN | * |
| ASSISTANT | courses:*, payments:*, attendance:*, students:read, messages:* |
| TEACHER | courses:read(own), resources:*, evaluations:read(own) |
| STUDENT | courses:read, enrollments:*(own), evaluations:*(own) |
| PARENT | students:read(children), enrollments:read(children), invoices:read(children) |

## 12.3 Protection OWASP

| Attaque | Protection |
|---------|-----------|
| XSS | CSP + React auto-échappement |
| CSRF | Tokens + SameSite cookies |
| SQL Injection | TypeORM (requêtes paramétrées) |
| Brute Force | Rate limiting + lockout |
| Upload | Magic bytes + MIME check |
| Session hijacking | JWT rotation + IP check |
| Data breach | AES-256 + pgcrypto |

---

# 13. Interface Utilisateur

## 13.1 Principes

- Design : Material Design 3
- Responsive : mobile-first (640/768/1024/1280/1536)
- Accessibilité : WCAG 2.1 AA
- Langue : français
- Apprentissage : ≤ 15 min

## 13.2 États des Composants

| État | Rendu |
|------|-------|
| Loading | Skeleton animation |
| Empty | Illustration + message + CTA |
| Error | Message + bouton réessayer |
| Success | Toast de confirmation |
| Offline | Bannière d'alerte |

## 13.3 Navigation par Rôle

**Admin :** Dashboard → Gestion (utilisateurs, cours, salles, campagnes) → Finances → Présences → Communication → Évaluations → Système

**Assistant :** Dashboard → Inscriptions → Cours → Finances → Élèves → Communication

**Enseignant :** Dashboard → Mes cours → Ressources → Finances → Communication

**Élève :** Dashboard → Mes cours → Ressources → Finances → Évaluations → Profil → Communication

**Parent :** Dashboard → Mes enfants → Finances → Approbations → Communication

---

# 14. Tests et Qualité

| Niveau | Outil | Cible | Fréquence |
|--------|-------|-------|-----------|
| Tests unitaires | Jest | ≥ 80 % | CI (chaque commit) |
| Tests intégration | Supertest | Flux critiques | CI (chaque push) |
| Tests charge | k6 | 500 utilisateurs | Avant release |
| Tests sécurité | OWASP ZAP | Top 10 | Trimestriel |
| Tests UAT | Manuel | Scénarios métier | 2 semaines avant production |

---

# 15. Déploiement et Maintenance

## 15.1 Pipeline CI/CD

Push → Lint → Tests unitaires → Build Docker → Security scan → Déploiement staging → Tests intégration → Déploiement production (blue/green, approbation manuelle) → Health checks → Rollback si échec

## 15.2 Sauvegardes

| Type | Fréquence | Rétention |
|------|-----------|-----------|
| Backup BD | Quotidien | 30 jours |
| WAL PostgreSQL | Continu | 7 jours |
| Fichiers | Quotidien | 30 jours |
| Configuration | À chaque déploiement | 10 versions |

## 15.3 SLA

| Incident | Réponse | Résolution |
|----------|---------|------------|
| Critique | ≤ 2 h | ≤ 8 h |
| Majeur | ≤ 4 h | ≤ 24 h |
| Mineur | ≤ 8 h | ≤ 72 h |

---

# 16. Annexes

## 16.1 Glossaire

| Terme | Définition |
|-------|-----------|
| ERP | Enterprise Resource Planning |
| RFID | Radio Frequency Identification |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| RTO | Recovery Time Objective |
| RPO | Recovery Point Objective |
| UAT | User Acceptance Testing |
| CSP | Content Security Policy |
| TOTP | Time-based One-Time Password |

## 16.2 Matrice de Traçabilité

| Objectif | Module | Exigences | Tests |
|----------|--------|-----------|-------|
| OS-01 Centralisation | M01-M12 | Toutes | Intégration |
| OS-02 Automatisation | M03, M04, M06 | EX-INSC, EX-COUR, EX-FIN | Unitaires + UAT |
| OS-03 Transparence | M05, M06, M10 | EX-RFID, EX-FIN, EX-DASH | UAT |
| OS-04 Outillage | M04, M07, M09 | EX-COUR, EX-RESS, EX-EVAL | UAT |
| OS-05 Pilotage | M10, M11, M12 | EX-DASH, EX-RAPP | Charge |
| OS-06 Sécurité | M12 | EX-ADMIN | Sécurité |
| OS-07 Scalabilité | Architecture | Non-fonctionnelles | Charge |

---

*Fin du document — CCFT V2.0 — Juin 2026*
