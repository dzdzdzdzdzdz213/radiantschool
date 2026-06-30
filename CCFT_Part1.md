# Cahier des Charges Fonctionnel et Technique

## Plateforme ERP de Gestion de Centre de Soutien Scolaire

---

| Référence | CCDT-ERP-SCOL-001 |
|-----------|-------------------|
| Version | 1.0 |
| Date | Juin 2026 |
| Statut | Version Finale |
| Classification | Confidentiel |

---

**Édité par :** [Nom du Consultant / Société]

**Destiné à :** [Nom du Client / Centre de Soutien Scolaire]

---

# Table des Matières

1. [Couverture et Identification du Projet](#1-couverture-et-identification-du-projet)
2. [Introduction](#2-introduction)
3. [Contexte Métier](#3-contexte-metier)
4. [Problématique et Énoncé du Problème](#4-problematique-et-enonce-du-probleme)
5. [Objectifs du Projet](#5-objectifs-du-projet)
6. [Périmètre du Projet](#6-perimetre-du-projet)
7. [Parties Prenantes et Gouvernance](#7-parties-prenantes-et-gouvernance)
8. [Exigences Fonctionnelles Détaillées](#8-exigences-fonctionnelles-detaillees)
9. [Exigences Non Fonctionnelles](#9-exigences-non-fonctionnelles)
10. [Cas d'Utilisation Complets](#10-cas-dutilisation-complets)
11. [User Stories](#11-user-stories)
12. [Règles de Gestion et Contraintes Métier](#12-regles-de-gestion-et-contraintes-metier)
13. [Diagrammes d'Activité](#13-diagrammes-dactivite)
14. [Diagrammes de Cas d'Utilisation](#14-diagrammes-de-cas-dutilisation)
15. [Diagrammes de Séquence](#15-diagrammes-de-sequence)
16. [Diagrammes de Classes](#16-diagrammes-de-classes)
17. [Modèle Conceptuel de Données (MCD)](#17-modele-conceptuel-de-donnees-mcd)
18. [Schéma de Base de Données](#18-schema-de-base-de-donnees)
19. [Spécification de l'API REST](#19-specification-de-lapi-rest)
20. [Architecture Frontend](#20-architecture-frontend)
21. [Architecture Backend](#21-architecture-backend)
22. [Architecture de Sécurité](#22-architecture-de-securite)
23. [Justification de la Stack Technologique](#23-justification-de-la-stack-technologique)
24. [Directives UX/UI](#24-directives-uxui)
25. [Descriptions des Maquettes et Wireframes](#25-descriptions-des-maquettes-et-wireframes)
26. [Structure de Navigation](#26-structure-de-navigation)
27. [Analyse des Risques](#27-analyse-des-risques)
28. [Contraintes du Projet](#28-contraintes-du-projet)
29. [Critères d'Acceptation](#29-criteres-dacceptation)
30. [Stratégie de Test](#30-strategie-de-test)
31. [Stratégie de Déploiement](#31-strategie-de-deploiement)
32. [Stratégie de Maintenance](#32-strategie-de-maintenance)
33. [Améliorations Futures](#33-ameliorations-futures)
34. [Conclusion](#34-conclusion)

---

# 1. Couverture et Identification du Projet

## 1.1 Fiche d'Identité du Projet

| Champ | Valeur |
|-------|--------|
| **Nom du Projet** | [À définir par le client] |
| **Code Projet** | ERP-SCOL-001 |
| **Nature du Projet** | Développement d'une application web ERP de gestion de centre de soutien scolaire |
| **Type de Projet** | Création ex nihilo (Greenfield) |
| **Secteur d'Activité** | Éducation et Soutien Scolaire |
| **Client** | [Nom du centre de soutien scolaire] |
| **Prestataire** | [Nom de la société de développement] |
| **Responsable Projet (Client)** | [Nom et fonction] |
| **Directeur Technique (Prestataire)** | [Nom et fonction] |
| **Budget Prévisionnel** | [À définir] |
| **Durée Estimée** | [À définir — estimation préliminaire : 8 à 12 mois] |
| **Date de Début** | [À définir] |
| **Date de Livraison** | [À définir] |

## 1.2 Historique des Révisions

| Version | Date | Auteur | Description des Modifications |
|---------|------|--------|-------------------------------|
| 0.1 | JJ/MM/AAAA | [Auteur] | Version préliminaire |
| 0.5 | JJ/MM/AAAA | [Auteur] | Relecture interne |
| 1.0 | JJ/MM/AAAA | [Auteur] | Version finale approuvée |

## 1.3 Documents de Référence

| Référence | Titre | Version |
|-----------|-------|---------|
| [REF-01] | Guide méthodologique ERP | 2.1 |
| [REF-02] | Norme RGPD / Loi 18-07 | Applicable |
| [REF-03] | Réglementation des centres de soutien scolaire | En vigueur |
| [REF-04] | Guide UX Material Design 3 | 3.0 |
| [REF-05] | Standards API REST (OpenAPI 3.1) | 3.1 |

## 1.4 Glossaire

| Terme | Définition |
|-------|-----------|
| **ERP** | Enterprise Resource Planning — Progiciel de gestion intégré |
| **RFID** | Radio Frequency Identification — Identification par radiofréquence |
| **JWT** | JSON Web Token — Jeton d'authentification JSON |
| **RBAC** | Role-Based Access Control — Contrôle d'accès par rôles |
| **CRUD** | Create, Read, Update, Delete — Opérations de base sur les données |
| **MCD** | Modèle Conceptuel de Données |
| **MLD** | Modèle Logique de Données |
| **MPD** | Modèle Physique de Données |
| **UML** | Unified Modeling Language — Langage de modélisation unifié |
| **API** | Application Programming Interface — Interface de programmation |
| **SPA** | Single Page Application — Application monopage |
| **SSR** | Server-Side Rendering — Rendu côté serveur |
| **PaaS** | Platform as a Service — Plateforme en tant que service |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **RGPD** | Règlement Général sur la Protection des Données |
| **SMTP** | Simple Mail Transfer Protocol |
| **HTTPS** | HyperText Transfer Protocol Secure |
| **2FA** | Two-Factor Authentication — Authentification à deux facteurs |
| **ORM** | Object-Relational Mapping — Mapping objet-relationnel |
| **OTP** | One-Time Password — Mot de passe à usage unique |

---

# 2. Introduction

## 2.1 Objet du Document

Le présent document constitue le Cahier des Charges Fonctionnel et Technique (CCFT) complet pour la conception, le développement et le déploiement d'une plateforme ERP web destinée à la gestion d'un centre de soutien scolaire privé. Ce document a pour vocation de formaliser l'intégralité des besoins fonctionnels, techniques, organisationnels et stratégiques du projet.

Il servira de référence contractuelle entre le client (le centre de soutien scolaire) et le prestataire de développement logiciel. Toute déviation par rapport aux spécifications énoncées dans ce document devra faire l'objet d'un avenant signé par les deux parties.

## 2.2 Structure du Document

Le document est organisé en 34 sections couvrant :

- L'analyse du contexte métier et des objectifs stratégiques ;
- La modélisation complète des processus fonctionnels ;
- Les exigences fonctionnelles détaillées pour chaque module ;
- Les exigences non fonctionnelles couvrant la performance, la sécurité et l'évolutivité ;
- L'architecture technique complète (frontend, backend, base de données, sécurité) ;
- Les diagrammes UML et schémas d'architecture ;
- Le planning prévisionnel, l'analyse des risques et la stratégie de déploiement ;
- Les critères d'acceptation et la stratégie de test.

## 2.3 Public Cible

Ce document s'adresse aux publics suivants :

- **Porteur de projet** : Validation des besoins et vision stratégique ;
- **Équipe de développement** : Spécifications techniques détaillées pour l'implémentation ;
- **Chef de projet** : Planification, suivi et contrôle du périmètre ;
- **Équipe QA** : Rédaction des cas de test et stratégie de validation ;
- **Architecte logiciel** : Conception de l'architecture technique ;
- **Designer UX/UI** : Conception des interfaces utilisateur ;
- **Développeurs frontend et backend** : Guide d'implémentation.

---

# 3. Contexte Métier

## 3.1 Présentation du Secteur du Soutien Scolaire en Algérie

Le secteur du soutien scolaire en Algérie connaît une croissance significative depuis plusieurs années. Face à un système éducatif national exigeant — avec des examens cruciaux tels que le Brevet d'Enseignement Moyen (BEM) et le Baccalauréat — les familles algériennes investissent massivement dans des cours de soutien complémentaires pour leurs enfants.

Les centres de soutien scolaire privés se multiplient dans les grandes villes (Alger, Oran, Constantine, Annaba, etc.) et commencent à s'implanter dans les villes secondaires. Ces centres proposent :

- Des cours de rattrapage et de renforcement ;
- Des préparations intensives aux examens nationaux ;
- Des cours particuliers individualisés ;
- Des stages pendant les vacances scolaires.

## 3.2 État des Lieux : Gestion Actuelle et Défis

La plupart des centres de soutien scolaire en Algérie fonctionnent encore avec des méthodes de gestion traditionnelles :

- **Gestion manuelle des inscriptions** : Fiches papier, registres manuscrits, classeurs ;
- **Suivi des présences** : Feuilles d'émargement papier, perte de données fréquente ;
- **Gestion des paiements** : Reçus manuscrits, suivi approximatif des impayés ;
- **Communication** : Appels téléphoniques, messages WhatsApp informels ;
- **Planification des cours** : Conflits d'horaires fréquents, double réservation.

Cette situation engendre de nombreux problèmes opérationnels :

- Lourdeur administrative chronophage ;
- Erreurs de saisie et pertes d'information ;
- Difficulté à obtenir une vision globale de l'activité ;
- Insatisfaction des parents face au manque de transparence ;
- Incapacité à scaler le modèle d'affaires.

## 3.3 Opportunité et Vision

La transformation numérique du centre de soutien scolaire représente une opportunité stratégique majeure :

- **Différenciation concurrentielle** : Offrir une expérience moderne et transparente ;
- **Efficacité opérationnelle** : Automatiser les tâches répétitives ;
- **Scalabilité** : Permettre la croissance du nombre d'élèves sans augmentation linéaire de la charge administrative ;
- **Data-driven** : Prendre des décisions basées sur des données fiables.

---

# 4. Problématique et Énoncé du Problème

## 4.1 Problèmes Identifiés

### 4.1.1 Problèmes Organisationnels

1. **Absence de centralisation des données** : Les informations relatives aux élèves, enseignants, cours et paiements sont dispersées dans des fichiers Excel, des classeurs papier et des emails. L'absence d'un référentiel unique entraîne des incohérences et des doubles saisies.

2. **Processus d'inscription laborieux** : L'inscription d'un nouvel élève nécessite la saisie manuelle de ses informations personnelles, de celles de ses parents, du niveau scolaire, des matières choisies, du type de cours, et de la session. Ce processus prend en moyenne 30 à 45 minutes par élève.

3. **Conflits d'horaires récurrents** : La planification manuelle des cours provoque régulièrement des conflits entre les disponibilités des enseignants, la capacité des salles et les emplois du temps des élèves.

4. **Suivi des présences inefficace** : Le pointage manuel des présences est sujet aux erreurs, consommateur de temps, et ne permet pas un suivi en temps réel.

5. **Gestion financière approximative** : Les paiements sont suivis sur des registres papier ou des tableurs. Les impayés ne sont pas détectés rapidement. Les relances sont effectuées manuellement.

### 4.1.2 Problèmes de Communication

1. **Manque de transparence pour les parents** : Les parents n'ont pas de visibilité en temps réel sur la présence de leurs enfants, leur progression, ou leur situation financière.

2. **Notifications absentes** : Aucun système automatisé pour informer les parties prenantes des changements de planning, des échéances de paiement, ou des annulations de cours.

3. **Canaux de communication fragmentés** : Les échanges entre parents, enseignants, assistants et administration se font via plusieurs canaux non intégrés (téléphone, WhatsApp, email, physique).

### 4.1.3 Problèmes de Pilotage

1. **Absence d'indicateurs de performance** : La direction ne dispose pas de tableaux de bord fiables pour piloter l'activité (taux d'occupation, revenus par matière, taux de rétention, etc.).

2. **Rapports manuels chronophages** : L'élaboration de rapports de gestion nécessite des heures de travail manuel de consolidation de données.

3. **Décisions basées sur l'intuition** : L'absence de données fiables conduit à des décisions stratégiques basées sur l'intuition plutôt que sur des faits.

## 4.2 Énoncé du Problème

> Le centre de soutien scolaire ne dispose pas d'un système d'information intégré permettant de gérer efficacement l'ensemble de ses processus métier (inscriptions, planification, suivi des présences, gestion financière, communication et reporting). Les méthodes de gestion actuelles (manuelles et semi-numériques) ne sont plus adaptées au volume d'activité actuel et constituent un frein à la croissance de l'établissement. Il est nécessaire de concevoir et développer une plateforme ERP web sur mesure qui centralise, automatise et optimise l'ensemble des processus opérationnels et de gestion.

---

# 5. Objectifs du Projet

## 5.1 Objectif Général

Concevoir, développer et déployer une plateforme ERP web complète, sécurisée et évolutive pour la gestion intégrale d'un centre de soutien scolaire privé. Cette plateforme doit couvrir l'ensemble du cycle de vie de la relation avec l'élève, depuis la pré-inscription jusqu'au suivi post-formation, en passant par la gestion administrative, financière, pédagogique et communicationnelle.

## 5.2 Objectifs Spécifiques

### OS1 — Centralisation des Données

- [OS1.1] Créer un référentiel unique et cohérent de toutes les données du centre (élèves, parents, enseignants, assistants, cours, salles, paiements).
- [OS1.2] Éliminer les doubles saisies et les incohérences par une gestion normalisée des données.
- [OS1.3] Garantir l'intégrité référentielle et la qualité des données.

### OS2 — Automatisation des Processus Métier

- [OS2.1] Automatiser le processus d'inscription en ligne avec vérification d'éligibilité en temps réel.
- [OS2.2] Générer automatiquement les fiches de présence, les factures, les reçus et les attestations.
- [OS2.3] Automatiser les relances de paiement et les notifications de changement de planning.
- [OS2.4] Mettre en place une planification intelligente des cours avec détection automatique des conflits.

### OS3 — Amélioration de l'Expérience Utilisateur

- [OS3.1] Offrir aux parents une visibilité en temps réel sur la scolarité de leurs enfants (présences, paiements).
- [OS3.2] Permettre aux élèves de gérer leur parcours de formation de manière autonome.
- [OS3.3] Faciliter le travail des enseignants par des outils de gestion de cours et de suivi pédagogique.
- [OS3.4] Optimiser le travail des assistants par l'automatisation des tâches administratives.

### OS4 — Pilotage et Prise de Décision

- [OS4.1] Fournir des tableaux de bord dynamiques avec des indicateurs clés de performance (KPI).
- [OS4.2] Générer automatiquement des rapports PDF et Excel pour l'analyse de l'activité.
- [OS4.3] Permettre une analyse financière détaillée (revenus par matière, par niveau, par enseignant).
- [OS4.4] Assurer une traçabilité complète de toutes les actions via des journaux d'audit.

### OS5 — Sécurité et Conformité

- [OS5.1] Garantir la confidentialité et l'intégrité des données conformément à la réglementation (loi 18-07, RGPD).
- [OS5.2] Mettre en place un système d'authentification robuste avec gestion fine des droits d'accès.
- [OS5.3] Assurer la sauvegarde automatique et la reprise après sinistre.
- [OS5.4] Maintenir des journaux d'audit complets pour toutes les actions sensibles.

### OS6 — Scalabilité

- [OS6.1] Concevoir une architecture capable de supporter la croissance du centre (multiplication par 10 du nombre d'élèves).
- [OS6.2] Permettre l'ouverture de nouveaux centres (architecture multi-établissement).
- [OS6.3] Assurer des performances constantes quelle que soit la charge.

---

# 6. Périmètre du Projet

## 6.1 Périmètre Fonctionnel

Le périmètre fonctionnel couvre les modules suivants :

### Module 1 : Gestion des Utilisateurs et Authentification

- Inscription et connexion des utilisateurs ;
- Vérification d'email ;
- Gestion des profils (5 rôles) ;
- Administration des comptes (validation, suspension, suppression) ;
- Réinitialisation de mot de passe ;
- Authentification JWT ;
- Contrôle d'accès basé sur les rôles (RBAC).

### Module 2 : Gestion des Inscriptions et Campagnes

- Inscription en ligne pour les nouveaux élèves ;
- Gestion des campagnes d'inscription (création, modification, activation) ;
- Choix du niveau scolaire, des matières, du type de cours ;
- Inscription en tant qu'élève régulier ou élève session unique ;
- Gestion des listes d'attente.

### Module 3 : Gestion des Cours et Planification

- Création et gestion des cours (normal, VIP, particulier) ;
- Planification des séances avec gestion des conflits ;
- Affectation des enseignants et des salles ;
- Suivi des capacités et des places disponibles ;
- Calendrier interactif par rôle.

### Module 4 : Gestion des Présences (RFID)

- Attribution des cartes RFID aux élèves ;
- Scan RFID à l'entrée du centre ;
- Enregistrement automatique de la présence ;
- Vérification du statut de paiement ;
- Alertes en temps réel (impayés, profil incomplet, carte inactive).

### Module 5 : Gestion Financière

- Suivi des paiements (mensuel, par séance, VIP, cours particuliers) ;
- Génération automatique des factures ;
- Génération des reçus PDF ;
- Historique des transactions ;
- Relances automatiques ;
- Calcul des revenus estimés par enseignant.

### Module 6 : Gestion des Ressources Pédagogiques

- Upload de fichiers (PDF, exercices, images, vidéos) ;
- Partage de liens externes ;
- Organisation par cours et par séance ;
- Téléchargement par les élèves.

### Module 7 : Système de Communication

- Messagerie interne (chat) ;
- Notifications système et email ;
- Calendrier partagé ;
- Alertes et rappels automatiques.

### Module 8 : Évaluations et Classements

- Évaluation des enseignants par les élèves (4 critères) ;
- Calcul automatique des notes moyennes ;
- Classement automatique des enseignants ;
- Affichage du leaderboard.

### Module 9 : Tableau de Bord et Reporting

- Tableaux de bord par rôle ;
- Indicateurs de performance (KPI) ;
- Rapports PDF et Excel ;
- Statistiques détaillées (revenus, fréquentation, popularité).

### Module 10 : Administration et Configuration

- Gestion des utilisateurs (CRUD) ;
- Configuration du système ;
- Journaux d'audit ;
- Sauvegardes automatiques ;
- Gestion des permissions ;
- Gestion des salles et équipements.

## 6.2 Périmètre Technique

Le périmètre technique couvre :

- **Frontend** : Application web monopage (SPA) responsive, accessible via navigateur moderne ;
- **Backend** : API RESTful avec architecture en couches ;
- **Base de données** : Système de gestion de base de données relationnelle ;
- **Sécurité** : Chiffrement, authentification JWT, RBAC, logs d'audit ;
- **Déploiement** : Infrastructure cloud ou serveur dédié, conteneurisation Docker ;
- **Intégrations** : Service email SMTP, génération PDF, RFID (API hardware).

## 6.3 Ce Qui est Hors Périmètre

- Gestion des notes officielles, bulletins scolaires ou certificats officiels de l'Éducation Nationale ;
- Gestion des examens officiels (BEM, BAC) ;
- Système de visioconférence intégré (utilisation d'API tierces si nécessaire) ;
- Application mobile native (le responsive web couvre ce besoin dans un premier temps) ;
- Module de comptabilité générale (liasse fiscale, bilan comptable) ;
- Portail de recrutement d'enseignants ;
- Site vitrine/publicitaire du centre ;
- Développement de l'API pour lecteurs RFID (interface uniquement).

---

# 7. Parties Prenantes et Gouvernance

## 7.1 Identification des Parties Prenantes

| Identifiant | Partie Prenante | Rôle dans le Projet | Implication |
|-------------|-----------------|---------------------|-------------|
| PP-01 | Direction du centre | Sponsor, décideur stratégique | Validation du budget, des orientations, recette finale |
| PP-02 | Administrateur du système | Utilisateur clé, expert métier | Définition des besoins avancés, validation |
| PP-03 | Assistant(e)s | Utilisateurs opérationnels | Définition des besoins quotidiens, tests |
| PP-04 | Enseignants | Utilisateurs finaux | Validation des fonctionnalités pédagogiques |
| PP-05 | Élèves | Bénéficiaires finaux | Tests d'usage, feedback UX |
| PP-06 | Parents | Bénéficiaires | Tests de l'interface parent |
| PP-07 | Chef de projet MOA | Maîtrise d'ouvrage | Coordination, recette, validation |
| PP-08 | Chef de projet MOE | Maîtrise d'oeuvre | Coordination technique, livraison |
| PP-09 | Architecte logiciel | Conception technique | Décisions d'architecture |
| PP-10 | Équipe de développement | Réalisation | Implémentation |
| PP-11 | Équipe QA / Testeurs | Validation | Tests fonctionnels et techniques |
| PP-12 | Designer UX/UI | Expérience utilisateur | Conception des interfaces |
| PP-13 | Hébergeur / DevOps | Infrastructure | Déploiement et maintenance |

## 7.2 Gouvernance du Projet

### 7.2.1 Comité de Pilotage (COPIL)

| Rôle | Composition | Fréquence |
|------|-------------|-----------|
| Président | Direction du centre | Mensuel |
| Membres | Chef de projet MOA, Chef de projet MOE, Architecte | Mensuel |
| Ordre du jour | Avancement, décisions stratégiques, validation des jalons, gestion des risques |

### 7.2.2 Comité Technique (COTECH)

| Rôle | Composition | Fréquence |
|------|-------------|-----------|
| Président | Chef de projet MOE | Bi-mensuel |
| Membres | Architecte, Lead développeur, Lead testeur, Chef de projet MOA | Bi-mensuel |
| Ordre du jour | Suivi technique, revue de code, résolution des blocages, planification des sprints |

### 7.2.3 Équipe de Projet

| Rôle | Responsabilités |
|------|-----------------|
| Chef de Projet MOA | Expression des besoins, recette, validation |
| Chef de Projet MOE | Planification, coordination technique, reporting |
| Architecte Logiciel | Conception, choix technologiques, revue d'architecture |
| Lead Développeur Frontend | Architecture frontend, développement, revue de code |
| Lead Développeur Backend | Architecture backend, développement, revue de code |
| Développeurs Frontend (x2) | Développement des interfaces utilisateur |
| Développeurs Backend (x2) | Développement des API et services |
| Designer UX/UI | Maquettes, prototypage, charte graphique |
| Data Architect | Modélisation des données, optimisation |
| Testeur QA | Tests fonctionnels, tests de non-régression, automatisation |
| DevOps | CI/CD, déploiement, monitoring |

---

# 8. Exigences Fonctionnelles Détaillées

## 8.1 Module Authentification et Gestion des Comptes

### 8.1.1 Inscription des Utilisateurs

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-AUTH-01 | Le système doit permettre à un nouvel élève de créer un compte avec les informations suivantes : nom, prénom, date de naissance, adresse email, mot de passe, numéro de téléphone, adresse postale, code postal, wilaya, commune | Critique |
| EF-AUTH-02 | Le système doit permettre à un nouvel élève de choisir entre deux types d'inscription : Élève régulier ou Élève session unique | Critique |
| EF-AUTH-03 | Le système doit envoyer un email de vérification après l'inscription | Critique |
| EF-AUTH-04 | Le système doit permettre la vérification de l'adresse email via un lien de confirmation | Critique |
| EF-AUTH-05 | Le système doit bloquer l'accès aux fonctionnalités tant que l'email n'est pas vérifié | Critique |
| EF-AUTH-06 | Le système doit permettre aux enseignants et aux assistants de s'inscrire avec les mêmes champs obligatoires, mais leur compte doit rester en attente de validation par l'administrateur | Critique |
| EF-AUTH-07 | Le système doit permettre l'authentification par email et mot de passe | Critique |
| EF-AUTH-08 | Le système doit permettre la réinitialisation du mot de passe via email | Haute |
| EF-AUTH-09 | Le système doit imposer un mot de passe d'au moins 8 caractères avec des critères de complexité (minuscule, majuscule, chiffre, caractère spécial) | Critique |
| EF-AUTH-10 | Le système doit proposer un mécanisme de déconnexion sécurisé invalidant le token JWT côté serveur | Haute |

### 8.1.2 Profil Utilisateur

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-PROF-01 | Le système doit permettre à chaque utilisateur de consulter et modifier son profil | Haute |
| EF-PROF-02 | Le système doit permettre à l'élève de compléter ses informations personnelles après inscription : photo, niveau scolaire, wilaya, école d'origine | Haute |
| EF-PROF-03 | Le système doit permettre à l'élève de renseigner les informations de ses parents (nom, prénom, email, téléphone, lien de parenté) | Critique |
| EF-PROF-04 | Le système doit permettre de renseigner plusieurs parents/tuteurs par élève | Haute |
| EF-PROF-05 | Le système doit permettre à l'enseignant de renseigner ses spécialités, disponibilités, mode d'enseignement (en ligne, présentiel, les deux), et biographie | Critique |
| EF-PROF-06 | Le système doit permettre à l'assistant de renseigner ses informations de contact et ses disponibilités | Haute |

### 8.1.3 Gestion des Rôles et Permissions

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-ROLE-01 | Le système doit implémenter 5 rôles distincts : Administrateur, Assistant, Enseignant, Élève, Parent | Critique |
| EF-ROLE-02 | Le système doit implémenter un contrôle d'accès basé sur les rôles (RBAC) | Critique |
| EF-ROLE-03 | Le système doit permettre à l'administrateur de consulter la liste des enseignants et assistants en attente de validation | Critique |
| EF-ROLE-04 | Le système doit permettre à l'administrateur d'approuver ou rejeter les comptes enseignants et assistants | Critique |
| EF-ROLE-05 | Le système doit permettre à l'administrateur de suspendre, activer ou supprimer tout compte utilisateur | Critique |
| EF-ROLE-06 | Le système doit permettre à l'administrateur de consulter les journaux d'activité de tout utilisateur | Haute |

## 8.2 Module Gestion des Inscriptions

### 8.2.1 Parcours d'Inscription de l'Élève

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-INSC-01 | Le système doit présenter un formulaire d'inscription en plusieurs étapes (wizard) | Critique |
| EF-INSC-02 | Étape 1 : Type d'inscription (régulier ou session unique) | Critique |
| EF-INSC-03 | Étape 2 : Choix du niveau scolaire (Primaire, Collège, Lycée avec sous-filières) | Critique |
| EF-INSC-04 | Étape 3 : Choix des matières (affichées en fonction du niveau sélectionné) | Critique |
| EF-INSC-05 | Étape 4 : Choix du type de cours (Normal ≤30, VIP ≤6, Particulier 1 ou 2 élèves) | Critique |
| EF-INSC-06 | Étape 5 : Sélection du groupe/créneau horaire disponible | Critique |
| EF-INSC-07 | Étape 6 : Récapitulatif et confirmation | Critique |
| EF-INSC-08 | Étape 7 : Paiement (pour les sessions uniques) ou génération de facture | Critique |
| EF-INSC-09 | Le système doit vérifier la disponibilité des places avant de finaliser l'inscription | Critique |
| EF-INSC-10 | Le système doit proposer des groupes alternatifs si le groupe choisi est complet | Haute |
| EF-INSC-11 | Le système doit permettre l'inscription à la liste d'attente si tous les groupes sont complets | Haute |
| EF-INSC-12 | Le système doit envoyer une confirmation d'inscription par email | Critique |

### 8.2.2 Campagnes d'Inscription

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-CAMP-01 | Le système doit permettre à l'administrateur de créer des campagnes d'inscription | Critique |
| EF-CAMP-02 | Chaque campagne doit avoir : nom, description, date de début, date de fin, cours disponibles, prix, nombre maximum de places | Critique |
| EF-CAMP-03 | Le système doit permettre d'activer/désactiver une campagne | Haute |
| EF-CAMP-04 | Le système doit afficher uniquement les campagnes actives lors de l'inscription | Haute |
| EF-CAMP-05 | Le système doit fermer automatiquement une campagne à sa date de fin | Haute |
| EF-CAMP-06 | Le système doit envoyer une notification lors de l'ouverture d'une campagne aux élèves précédents | Moyenne |

## 8.3 Module Gestion des Cours et Planification

### 8.3.1 Types de Cours

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-COUR-01 | Le système doit permettre la création de cours de type Normal avec une capacité maximale de 30 élèves | Critique |
| EF-COUR-02 | Le système doit permettre la création de cours de type VIP avec une capacité maximale de 6 élèves | Critique |
| EF-COUR-03 | Le système doit permettre la création de cours de type Particulier avec un ou deux élèves | Critique |
| EF-COUR-04 | Pour les cours particuliers à deux élèves, le système doit nécessiter l'approbation du parent et de l'enseignant | Critique |
| EF-COUR-05 | Le système doit associer chaque cours à une matière spécifique | Critique |
| EF-COUR-06 | Le système doit associer chaque cours à un enseignant | Critique |
| EF-COUR-07 | Le système doit associer chaque cours à un niveau scolaire | Critique |

### 8.3.2 Planification Intelligente

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-PLAN-01 | Le système doit vérifier automatiquement les conflits d'horaires pour les enseignants avant d'enregistrer un cours | Critique |
| EF-PLAN-02 | Le système doit vérifier automatiquement les conflits d'horaires pour les salles avant d'enregistrer un cours | Critique |
| EF-PLAN-03 | Le système doit vérifier automatiquement les conflits d'horaires pour les élèves avant de les inscrire à un cours | Critique |
| EF-PLAN-04 | Le système doit empêcher l'enregistrement d'un cours en cas de conflit détecté | Critique |
| EF-PLAN-05 | Le système doit suggérer des créneaux alternatifs disponibles en cas de conflit | Haute |
| EF-PLAN-06 | Le système doit afficher un calendrier visuel par enseignant, par salle et par élève | Haute |
| EF-PLAN-07 | Le système doit permettre la modification d'un cours existant avec revérification des conflits | Critique |

### 8.3.3 Gestion des Salles

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-SALL-01 | Le système doit permettre la gestion des salles avec les informations : nom, capacité, équipement (tableau, vidéoprojecteur, climatisation, etc.), étage | Critique |
| EF-SALL-02 | Le système doit permettre de visualiser la disponibilité des salles en temps réel | Haute |
| EF-SALL-03 | Le système doit permettre la réservation automatique des salles lors de la création d'un cours | Critique |
| EF-SALL-04 | Le système doit permettre la réservation manuelle des salles par l'assistant ou l'administrateur | Haute |

## 8.4 Module Présences et RFID

### 8.4.1 Gestion des Cartes RFID

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-RFID-01 | Le système doit permettre d'associer une carte RFID à un élève lors de son inscription physique | Critique |
| EF-RFID-02 | Le système doit permettre d'activer ou désactiver une carte RFID | Critique |
| EF-RFID-03 | Le système doit associer un identifiant unique de carte RFID à chaque élève | Critique |
| EF-RFID-04 | Le système doit enregistrer la date d'attribution de la carte RFID | Haute |
| EF-RFID-05 | Le système doit permettre le remplacement d'une carte RFID perdue ou endommagée | Haute |

### 8.4.2 Pointage RFID

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-POIN-01 | Le système doit recevoir les données de scan RFID depuis le lecteur physique | Critique |
| EF-POIN-02 | Le système doit identifier l'élève à partir de l'identifiant RFID scanné | Critique |
| EF-POIN-03 | Le système doit enregistrer la date et l'heure du scan | Critique |
| EF-POIN-04 | Le système doit enregistrer la présence de l'élève pour la séance en cours | Critique |
| EF-POIN-05 | Le système doit vérifier le statut de paiement de l'élève au moment du scan | Critique |
| EF-POIN-06 | Le système doit vérifier que l'élève est actuellement inscrit à un cours actif | Critique |
| EF-POIN-07 | Le système doit afficher une alerte si le paiement est en retard | Critique |
| EF-POIN-08 | Le système doit afficher une alerte si le profil de l'élève est incomplet | Haute |
| EF-POIN-09 | Le système doit afficher une alerte si la carte RFID est inactive | Critique |
| EF-POIN-10 | Le système doit mettre à jour le tableau de bord en temps réel après chaque scan | Haute |
| EF-POIN-11 | Le système doit permettre l'enregistrement manuel d'une présence par l'assistant (en cas de défaillance RFID) | Haute |

## 8.5 Module Gestion Financière

### 8.5.1 Gestion des Paiements

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-PAIE-01 | Le système doit supporter les paiements mensuels (abonnement) | Critique |
| EF-PAIE-02 | Le système doit supporter les paiements par séance (à l'unité) | Critique |
| EF-PAIE-03 | Le système doit supporter les paiements pour les cours VIP | Critique |
| EF-PAIE-04 | Le système doit supporter les paiements pour les cours particuliers | Critique |
| EF-PAIE-05 | Le système doit enregistrer chaque paiement avec les informations : montant, date, méthode de paiement (espèces, virement, carte bancaire, chèque), références, commentaire | Critique |
| EF-PAIE-06 | Le système doit permettre les paiements en plusieurs fois | Haute |
| EF-PAIE-07 | Le système doit suivre l'historique complet des paiements par élève | Critique |
| EF-PAIE-08 | Le système doit permettre les remboursements partiels ou totaux | Haute |
| EF-PAIE-09 | Le système doit calculer automatiquement le solde restant dû pour chaque élève | Critique |

### 8.5.2 Facturation

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-FACT-01 | Le système doit générer automatiquement les factures périodiques pour les abonnements mensuels | Critique |
| EF-FACT-02 | Le système doit générer une facture pour chaque paiement effectué | Critique |
| EF-FACT-03 | Le système doit numéroter automatiquement les factures selon un format configurable | Critique |
| EF-FACT-04 | Le système doit générer les factures au format PDF | Critique |
| EF-FACT-05 | Le système doit générer les reçus de paiement au format PDF | Critique |
| EF-FACT-06 | Le système doit permettre la visualisation et le téléchargement des factures par l'élève et le parent | Critique |
| EF-FACT-07 | Le système doit intégrer les informations légales du centre sur les factures (nom, adresse, NIF, RC, etc.) | Critique |
| EF-FACT-08 | Le système doit envoyer automatiquement les factures par email | Haute |

### 8.5.3 Revenus Enseignants

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-REVE-01 | Le système doit calculer le revenu mensuel estimé pour chaque enseignant | Haute |
| EF-REVE-02 | Le système doit afficher à l'enseignant son historique de paiement (rémunérations) | Haute |
| EF-REVE-03 | Le système doit permettre à l'administrateur de configurer les taux de rémunération par enseignant | Haute |

## 8.6 Module Ressources Pédagogiques

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-RESS-01 | Le système doit permettre aux enseignants de téléverser des fichiers PDF | Critique |
| EF-RESS-02 | Le système doit permettre aux enseignants de téléverser des exercices (formats : PDF, DOCX, XLSX) | Critique |
| EF-RESS-03 | Le système doit permettre aux enseignants de téléverser des images (PNG, JPG) | Haute |
| EF-RESS-04 | Le système doit permettre aux enseignants de téléverser des vidéos (MP4, WebM) — limite de taille configurable | Haute |
| EF-RESS-05 | Le système doit permettre aux enseignants d'ajouter des liens externes (URL) | Haute |
| EF-RESS-06 | Le système doit organiser les ressources par cours et par séance | Critique |
| EF-RESS-07 | Le système doit permettre aux élèves de télécharger/consulter les ressources | Critique |
| EF-RESS-08 | Le système doit limiter la taille des fichiers téléversés (limite configurable par type) | Haute |
| EF-RESS-09 | Le système doit bloquer les types de fichiers non autorisés (sécurité) | Critique |

## 8.7 Module Communication et Notifications

### 8.7.1 Messagerie Interne (Chat)

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-CHAT-01 | Le système doit implémenter un système de messagerie interne entre les utilisateurs | Haute |
| EF-CHAT-02 | Le parent doit pouvoir communiquer avec l'assistant | Haute |
| EF-CHAT-03 | L'enseignant doit pouvoir communiquer avec l'assistant | Haute |
| EF-CHAT-04 | L'élève doit pouvoir communiquer avec l'assistant | Haute |
| EF-CHAT-05 | L'administrateur doit pouvoir communiquer avec tous les utilisateurs | Haute |
| EF-CHAT-06 | Le système doit permettre les conversations individuelles et de groupe | Moyenne |
| EF-CHAT-07 | Le système doit notifier les nouveaux messages | Haute |
| EF-CHAT-08 | Le système doit indiquer le statut des messages (lu/non lu) | Haute |
| EF-CHAT-09 | Le système doit permettre l'envoi de pièces jointes dans les messages | Moyenne |

### 8.7.2 Notifications

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-NOTI-01 | Le système doit envoyer des notifications par email | Critique |
| EF-NOTI-02 | Le système doit envoyer des notifications système (dans l'application) | Critique |
| EF-NOTI-03 | Le système doit envoyer des rappels de paiement automatiques | Critique |
| EF-NOTI-04 | Le système doit envoyer des rappels de cours (avant une séance) | Haute |
| EF-NOTI-05 | Le système doit notifier les annulations de cours | Critique |
| EF-NOTI-06 | Le système doit notifier les changements d'horaire | Critique |
| EF-NOTI-07 | Le système doit notifier les confirmations d'inscription | Critique |
| EF-NOTI-08 | Le système doit envoyer une notification lors de l'ouverture d'une place sur la liste d'attente | Haute |
| EF-NOTI-09 | Le système doit permettre la configuration des préférences de notification par utilisateur | Moyenne |
| EF-NOTI-10 | Le système doit permettre l'envoi de notifications manuelles par l'administrateur | Haute |

## 8.8 Module Évaluations et Classement

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-EVAL-01 | Le système doit permettre aux élèves d'évaluer leurs enseignants | Haute |
| EF-EVAL-02 | L'évaluation doit porter sur 4 critères : qualité d'enseignement, communication, ponctualité, organisation | Haute |
| EF-EVAL-03 | Chaque critère est noté sur une échelle de 1 à 5 étoiles | Haute |
| EF-EVAL-04 | Le système doit calculer automatiquement la note moyenne pour chaque enseignant | Haute |
| EF-EVAL-05 | Le système doit générer automatiquement un classement des enseignants (leaderboard) | Haute |
| EF-EVAL-06 | Le système doit afficher le leaderboard aux élèves | Haute |
| EF-EVAL-07 | Le système doit permettre à l'enseignant de voir ses évaluations (sans identifier l'élève) | Haute |
| EF-EVAL-08 | Le système doit permettre à l'administrateur de voir toutes les évaluations | Haute |

## 8.9 Module Tableau de Bord et Statistiques

### 8.9.1 Indicateurs du Tableau de Bord Administrateur

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-STAT-01 | Le tableau de bord doit afficher le revenu total (période configurable) | Critique |
| EF-STAT-02 | Le tableau de bord doit afficher le nombre d'élèves actifs | Critique |
| EF-STAT-03 | Le tableau de bord doit afficher le nombre d'élèves inactifs | Haute |
| EF-STAT-04 | Le tableau de bord doit afficher le taux d'occupation des cours | Haute |
| EF-STAT-05 | Le tableau de bord doit afficher les enseignants les plus populaires | Haute |
| EF-STAT-06 | Le tableau de bord doit afficher les matières les plus populaires | Haute |
| EF-STAT-07 | Le tableau de bord doit afficher le revenu par enseignant | Haute |
| EF-STAT-08 | Le tableau de bord doit afficher le revenu par matière | Haute |
| EF-STAT-09 | Le tableau de bord doit afficher le revenu par niveau scolaire | Haute |
| EF-STAT-10 | Le tableau de bord doit afficher la croissance mensuelle (revenus, inscriptions) | Haute |
| EF-STAT-11 | Le tableau de bord doit afficher la répartition des présences | Haute |
| EF-STAT-12 | Le tableau de bord doit être mis à jour en temps réel ou quasi-réel | Haute |

### 8.9.2 Tableaux de Bord par Rôle

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-DASH-01 | Le tableau de bord enseignant doit afficher ses cours à venir, son revenu estimé, ses évaluations | Haute |
| EF-DASH-02 | Le tableau de bord assistant doit afficher les inscriptions en attente, les paiements du jour, les présences | Haute |
| EF-DASH-03 | Le tableau de bord élève doit afficher son emploi du temps, ses prochains cours, ses notifications | Haute |
| EF-DASH-04 | Le tableau de bord parent doit afficher les informations de ses enfants (présences, factures) | Haute |

## 8.10 Module Rapports

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-RAPP-01 | Le système doit permettre la génération de rapports en format PDF | Haute |
| EF-RAPP-02 | Le système doit permettre la génération de rapports en format Excel | Haute |
| EF-RAPP-03 | Les rapports doivent inclure : rapport financier, rapport de fréquentation, rapport par enseignant, rapport par matière | Haute |
| EF-RAPP-04 | Le système doit permettre la sélection d'une période pour chaque rapport | Haute |
| EF-RAPP-05 | Le système doit permettre l'export et le téléchargement des rapports | Haute |

## 8.11 Module Administration

| Référence | Description | Priorité |
|-----------|-------------|----------|
| EF-ADMI-01 | Le système doit permettre la gestion complète des utilisateurs (CRUD) | Critique |
| EF-ADMI-02 | Le système doit permettre la configuration des paramètres système (nom du centre, devise, langue, fuseau horaire, etc.) | Critique |
| EF-ADMI-03 | Le système doit permettre la consultation des journaux d'audit | Critique |
| EF-ADMI-04 | Le système doit permettre le déclenchement manuel des sauvegardes | Haute |
| EF-ADMI-05 | Le système doit permettre la configuration des sauvegardes automatiques | Haute |
| EF-ADMI-06 | Le système doit permettre la gestion des permissions des rôles | Critique |
| EF-ADMI-07 | Le système doit permettre la gestion des salles et équipements | Haute |
| EF-ADMI-08 | Le système doit permettre la gestion des niveaux scolaires et matières | Critique |
| EF-ADMI-09 | Le système doit permettre l'import/export de données (Excel) | Moyenne |

---

# 9. Exigences Non Fonctionnelles

## 9.1 Performance

| Référence | Description | Cible | Priorité |
|-----------|-------------|-------|----------|
| ENF-PERF-01 | Temps de chargement des pages | ≤ 2 secondes (chargement initial) | Haute |
| ENF-PERF-02 | Temps de réponse API (95e percentile) | ≤ 500 ms | Critique |
| ENF-PERF-03 | Temps de réponse des requêtes base de données | ≤ 200 ms (requêtes simples) | Critique |
| ENF-PERF-04 | Temps de génération d'un rapport PDF | ≤ 5 secondes | Haute |
| ENF-PERF-05 | Temps de synchronisation RFID vers mise à jour dashboard | ≤ 3 secondes | Critique |
| ENF-PERF-06 | Capacité de montée en charge simultanée | ≥ 500 utilisateurs concurrents | Haute |
| ENF-PERF-07 | Temps d'upload de fichier | ≤ 10 secondes pour 10 Mo | Moyenne |
| ENF-PERF-08 | Taille maximale des fichiers uploadés | 50 Mo (vidéos : 200 Mo) | Haute |

## 9.2 Disponibilité et Fiabilité

| Référence | Description | Cible | Priorité |
|-----------|-------------|-------|----------|
| ENF-DISP-01 | Taux de disponibilité (Uptime) | ≥ 99,5% (hors maintenance programmée) | Critique |
| ENF-DISP-02 | Fenêtre de maintenance programmée | Maximum 4 heures par mois (dimanche 02:00-06:00) | Haute |
| ENF-DISP-03 | Reprise après sinistre (RTO) | ≤ 4 heures | Critique |
| ENF-DISP-04 | Perte de données maximale admissible (RPO) | ≤ 15 minutes | Critique |
| ENF-DISP-05 | Redondance des données (backup) | Quotidienne avec rétention 30 jours | Critique |
| ENF-DISP-06 | Mode dégradé fonctionnel | Dashboard et présences restent accessibles même si module finances indisponible | Haute |

## 9.3 Sécurité

| Référence | Description | Priorité |
|-----------|-------------|----------|
| ENF-SECU-01 | Authentification par JWT avec expiration configurable | Critique |
| ENF-SECU-02 | Chiffrement des mots de passe avec bcrypt (coût ≥ 12) ou argon2 | Critique |
| ENF-SECU-03 | Communication entièrement chiffrée via HTTPS/TLS 1.3 | Critique |
| ENF-SECU-04 | Contrôle d'accès basé sur les rôles (RBAC) côté serveur | Critique |
| ENF-SECU-05 | Validation de toutes les entrées utilisateur côté serveur | Critique |
| ENF-SECU-06 | Protection contre les attaques XSS (Content Security Policy) | Critique |
| ENF-SECU-07 | Protection contre les attaques CSRF (tokens) | Critique |
| ENF-SECU-08 | Protection contre les injections SQL (ORM/requêtes paramétrées) | Critique |
| ENF-SECU-09 | Rate limiting sur les endpoints d'authentification (max 5 tentatives/minute) | Critique |
| ENF-SECU-10 | Journalisation de toutes les actions sensibles (logs d'audit) | Critique |
| ENF-SECU-11 | Politique de mot de passe fort (min 8 caractères, complexité) | Critique |
| ENF-SECU-12 | Session timeout après 30 minutes d'inactivité | Haute |
| ENF-SECU-13 | Chiffrement des données sensibles au repos (AES-256) | Haute |
| ENF-SECU-14 | Headers de sécurité HTTP (HSTS, X-Frame-Options, X-Content-Type-Options) | Critique |

## 9.4 Évolutivité

| Référence | Description | Cible | Priorité |
|-----------|-------------|-------|----------|
| ENF-EVOL-01 | Architecture modulaire permettant l'ajout de nouveaux modules sans impacter l'existant | Critique |
| ENF-EVOL-02 | Capacité de scaling horizontal de l'API | Multi-instances sans état (stateless) | Haute |
| ENF-EVOL-03 | Indépendance des couches (frontend, backend, base de données) | Oui | Critique |
| ENF-EVOL-04 | Possibilité d'ajouter de nouveaux types de cours sans développement | Haute |
| ENF-EVOL-05 | Possibilité d'ajouter de nouveaux critères d'évaluation sans développement | Moyenne |

## 9.5 Compatibilité et Accessibilité

| Référence | Description | Cible | Priorité |
|-----------|-------------|-------|----------|
| ENF-COMP-01 | Compatibilité navigateurs | Chrome, Firefox, Safari, Edge (2 dernières versions) | Critique |
| ENF-COMP-02 | Responsive design | Mobile, tablette, desktop | Critique |
| ENF-COMP-03 | Accessibilité | Conformité WCAG 2.1 niveau AA | Haute |
| ENF-COMP-04 | Compatibilité des lecteurs RFID | API standard (protocole série TCP/IP ou HTTP) | Haute |

## 9.6 Maintenance et Support

| Référence | Description | Priorité |
|-----------|-------------|----------|
| ENF-MAINT-01 | Code source documenté (JSDoc / Docstrings) | Haute |
| ENF-MAINT-02 | Tests unitaires avec couverture ≥ 80% | Critique |
| ENF-MAINT-03 | Tests d'intégration pour les flux critiques | Critique |
| ENF-MAINT-04 | Documentation technique complète (architecture, API, déploiement) | Critique |
| ENF-MAINT-05 | Backend déployé en conteneurs Docker | Haute |
| ENF-MAINT-06 | Pipeline CI/CD automatisé | Haute |

## 9.7 Expérience Utilisateur

| Référence | Description | Priorité |
|-----------|-------------|----------|
| ENF-UX-01 | Temps d'apprentissage pour un nouvel utilisateur ≤ 15 minutes | Haute |
| ENF-UX-02 | Formulaires avec validation en temps réel | Critique |
| ENF-UX-03 | Messages d'erreur explicites en français | Critique |
| ENF-UX-04 | Feedback visuel pour toutes les actions | Haute |
| ENF-UX-05 | Support des écrans de chargement et états vides | Haute |

## 9.8 Intégration

| Référence | Description | Priorité |
|-----------|-------------|----------|
| ENF-INT-01 | Service d'envoi d'emails (SMTP ou API transactionnelle) | Critique |
| ENF-INT-02 | Service de génération de PDF | Critique |
| ENF-INT-03 | Interface API pour lecteurs RFID | Haute |
| ENF-INT-04 | Export Excel via bibliothèque dédiée | Haute |

---
