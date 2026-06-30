# Cahier des Charges Fonctionnel et Technique — Partie 2

---

# 10. Cas d'Utilisation Complets

## 10.1 Catalogue des Cas d'Utilisation

| ID | Titre | Acteur Principal | Précondition | Postcondition |
|----|-------|------------------|--------------|---------------|
| UC-01 | Créer un compte élève | Visiteur / Élève | Aucune | Compte créé, email de vérification envoyé |
| UC-02 | Vérifier l'adresse email | Élève | Avoir un compte non vérifié | Email vérifié, accès accordé |
| UC-03 | Se connecter | Tous les rôles | Avoir un compte vérifié/validé | Session ouverte, token JWT généré |
| UC-04 | Compléter le profil élève | Élève | Être connecté avec email vérifié | Profil complété |
| UC-05 | Renseigner les informations parents | Élève | Avoir complété son profil | Parents enregistrés |
| UC-06 | Choisir niveau et matières | Élève | Profil complété | Niveau et matières sélectionnés |
| UC-07 | S'inscrire à un cours | Élève | Avoir choisi niveau et matières | Inscription enregistrée |
| UC-08 | Consulter l'emploi du temps | Tous | Être connecté | Emploi du temps affiché |
| UC-09 | Scanner une carte RFID | Système RFID / Assistant | Carte RFID active et associée | Présence enregistrée |
| UC-10 | Consulter les présences | Élève, Parent, Enseignant | Être connecté | Historique des présences affiché |
| UC-11 | Effectuer un paiement | Assistant, Admin, Élève | Avoir une inscription active | Paiement enregistré, reçu généré |
| UC-12 | Consulter les factures | Élève, Parent | Être connecté | Factures affichées |
| UC-13 | Télécharger une ressource | Élève | Être inscrit au cours | Fichier téléchargé |
| UC-14 | Évaluer un enseignant | Élève | Avoir suivi au moins un cours avec cet enseignant | Évaluation enregistrée |
| UC-15 | Créer un cours | Admin, Assistant | Disposer d'un enseignant et d'une salle | Cours créé |
| UC-16 | Modifier un cours | Admin, Assistant | Le cours existe | Cours modifié |
| UC-17 | Approuver un compte enseignant | Admin | Compte enseignant en attente | Compte approuvé |
| UC-18 | Créer une campagne d'inscription | Admin | Aucune | Campagne créée |
| UC-19 | Consulter le tableau de bord | Tous | Être connecté | Dashboard affiché |
| UC-20 | Générer un rapport | Admin | Données disponibles | Rapport PDF/Excel généré |
| UC-21 | Envoyer un message | Tous | Être connecté | Message envoyé |
| UC-22 | Gérer la liste d'attente | Système / Assistant | Classe complète | Élève ajouté à la liste d'attente |
| UC-23 | Gérer les permissions | Admin | Aucune | Permissions mises à jour |
| UC-24 | Consulter le leaderboard | Élève, Admin | Évaluations existantes | Classement affiché |

## 10.2 Cas d'Utilisation Détaillés

### 10.2.1 UC-01 : Créer un compte élève

**Acteur principal :** Visiteur (futur élève)

**Précondition :** Aucune

**Déclencheur :** L'utilisateur clique sur « S'inscrire »

**Scénario principal :**
1. L'utilisateur accède à la page d'inscription
2. Le système affiche le formulaire d'inscription
3. L'utilisateur sélectionne « Élève régulier » ou « Élève session unique »
4. L'utilisateur saisit ses informations personnelles (nom, prénom, email, téléphone, date de naissance, adresse, mot de passe)
5. L'utilisateur accepte les conditions d'utilisation
6. L'utilisateur soumet le formulaire
7. Le système valide les champs obligatoires et le format des données
8. Le système vérifie l'unicité de l'email
9. Le système crée le compte avec le rôle « Élève » et statut « Email non vérifié »
10. Le système génère un token de vérification d'email
11. Le système envoie un email de vérification à l'adresse fournie
12. Le système affiche un message de confirmation invitant à vérifier l'email

**Scénarios alternatifs :**
- 3a. L'utilisateur peut aussi s'inscrire en tant qu'enseignant ou assistant (redirection vers formulaire différent)
- 8a. L'email existe déjà : le système affiche un message d'erreur

**Postcondition :** Compte créé avec statut « Email non vérifié »

---

### 10.2.2 UC-07 : S'inscrire à un cours

**Acteur principal :** Élève (connecté et email vérifié)

**Précondition :**
- L'élève a complété son profil
- L'élève a renseigné les informations de ses parents
- L'élève a choisi son niveau et ses matières
- Une campagne d'inscription est active

**Déclencheur :** L'élève clique sur « S'inscrire à un cours »

**Scénario principal :**
1. Le système affiche la liste des cours disponibles pour le niveau et les matières de l'élève
2. L'élève sélectionne un type de cours (Normal, VIP, Particulier)
3. Le système affiche les groupes disponibles avec leurs créneaux horaires
4. L'élève sélectionne un groupe
5. Le système vérifie la disponibilité du groupe (places restantes)
6. Le système vérifie les conflits d'horaires avec les autres cours de l'élève
7. Le système enregistre l'inscription
8. Le système met à jour le compteur de places disponibles
9. Le système génère la facture si nécessaire
10. Le système envoie un email de confirmation à l'élève et aux parents
11. Le système notifie l'assistant de la nouvelle inscription

**Scénarios alternatifs :**
- 5a. Le groupe est complet : le système propose des groupes alternatifs. Si aucun groupe n'est disponible, le système propose d'ajouter l'élève à la liste d'attente
- 6a. Conflit d'horaire détecté : le système affiche les conflits, l'élève doit choisir un autre créneau
- 4a. Cours Particulier (2 élèves) : le système nécessite l'approbation du second parent et de l'enseignant. L'inscription est marquée « En attente d'approbation »

**Postcondition :** L'élève est inscrit au cours (statut actif ou en attente)

---

### 10.2.3 UC-09 : Scanner une carte RFID

**Acteur principal :** Système RFID (déclenché par le scan physique)

**Précondition :**
- L'élève possède une carte RFID active
- L'élève est inscrit à un cours programmé au moment du scan

**Déclencheur :** La carte RFID est scannée sur le lecteur à l'entrée du centre

**Scénario principal :**
1. Le lecteur RFID transmet l'identifiant de la carte au système
2. Le système recherche l'élève associé à cet identifiant RFID
3. Le système vérifie que la carte RFID est active
4. Le système vérifie que l'élève a un profil complet
5. Le système vérifie le statut de paiement de l'élève
6. Le système vérifie que l'élève est inscrit à un cours actif à l'heure actuelle
7. Le système enregistre la présence (date, heure d'entrée)
8. Le système met à jour le tableau de bord en temps réel
9. Le système affiche un écran de validation (succès) sur le poste du lecteur

**Scénarios alternatifs :**
- 3a. Carte inactive : Alerte affichée, présence non enregistrée
- 4a. Profil incomplet : Alerte affichée invitant à compléter le profil
- 5a. Paiement en retard : Alerte affichée, présence enregistrée avec avertissement
- 6a. Aucun cours programmé à cette heure : Alerte affichée, présence non enregistrée

**Postcondition :** Présence enregistrée (ou refusée avec motif)

---

### 10.2.4 UC-11 : Effectuer un paiement

**Acteur principal :** Assistant (ou Administrateur)

**Précondition :**
- L'élève a une inscription active
- L'assistant est connecté avec les droits appropriés

**Déclencheur :** L'assistant sélectionne un élève pour effectuer un encaissement

**Scénario principal :**
1. L'assistant recherche l'élève (nom, email, RFID, matricule)
2. Le système affiche la fiche financière de l'élève (soldes, échéances)
3. L'assistant sélectionne le type de paiement (mensuel, séance, VIP, particulier)
4. L'assistant saisit le montant, la méthode de paiement (espèces, virement, carte, chèque), la date, et optionnellement une référence et un commentaire
5. Le système valide le montant saisi
6. Le système enregistre le paiement
7. Le système met à jour le solde de l'élève
8. Le système génère un reçu PDF numéroté
9. Le système envoie le reçu par email à l'élève et aux parents
10. Le système affiche une confirmation à l'assistant

**Scénarios alternatifs :**
- 5a. Montant erroné (inférieur au dû) : le système affiche un avertissement mais permet l'enregistrement partiel
- 4a. Remboursement : sélection du type « Remboursement », montant négatif validé

**Postcondition :** Paiement enregistré, reçu généré et envoyé

---

### 10.2.5 UC-15 : Créer un cours

**Acteur principal :** Administrateur (ou Assistant)

**Précondition :**
- Un enseignant est disponible
- Une salle est disponible

**Déclencheur :** L'administrateur clique sur « Nouveau cours »

**Scénario principal :**
1. L'administrateur remplit le formulaire de création de cours :
   - Type de cours (Normal, VIP, Particulier)
   - Matière
   - Niveau scolaire
   - Enseignant
   - Salle (si présentiel)
   - Capacité maximale
   - Jours et horaires (créneaux récurrents)
   - Prix
   - Période de validité (date début, date fin)
2. Le système vérifie automatiquement les conflits :
   - Disponibilité de l'enseignant
   - Disponibilité de la salle
3. Le système affiche un récapitulatif
4. L'administrateur confirme
5. Le système crée le cours avec statut « Actif »
6. Le système met à jour le calendrier

**Scénarios alternatifs :**
- 2a. Conflit enseignant détecté : message d'erreur listant les conflits, suggestion de créneaux alternatifs
- 2b. Conflit salle détecté : message d'erreur, suggestion de salles alternatives

**Postcondition :** Cours créé et visible dans le calendrier

---

### 10.2.6 UC-14 : Évaluer un enseignant

**Acteur principal :** Élève

**Précondition :**
- L'élève a suivi au moins un cours avec l'enseignant à évaluer
- L'élève n'a pas déjà évalué cet enseignant pour cette période

**Déclencheur :** L'élève clique sur « Évaluer » pour un enseignant depuis son historique de cours

**Scénario principal :**
1. Le système affiche le formulaire d'évaluation pour l'enseignant sélectionné
2. L'élève attribue une note de 1 à 5 étoiles pour chaque critère :
   - Qualité d'enseignement
   - Communication
   - Ponctualité
   - Organisation
3. Optionnellement, l'élève peut ajouter un commentaire écrit
4. L'élève soumet l'évaluation
5. Le système valide les données
6. Le système enregistre l'évaluation
7. Le système recalcule la note moyenne de l'enseignant
8. Le système met à jour le classement des enseignants
9. Le système affiche un message de remerciement

**Postcondition :** Évaluation enregistrée, note moyenne mise à jour

---

# 11. User Stories

## 11.1 Élève

| ID | En tant que... | Je veux... | Afin de... | Priorité |
|----|---------------|-----------|------------|----------|
| US-ELV-01 | Élève | Créer un compte facilement avec mon email | Accéder aux fonctionnalités de la plateforme | Critique |
| US-ELV-02 | Élève | Vérifier mon adresse email via un lien | Sécuriser mon compte | Critique |
| US-ELV-03 | Élève | Compléter mon profil avec mes informations personnelles | Permettre au centre de me connaître | Critique |
| US-ELV-04 | Élève | Ajouter les informations de mes parents | Permettre au centre de contacter mes parents | Critique |
| US-ELV-05 | Élève | Choisir mon niveau scolaire et mes matières | Voir uniquement les cours qui me concernent | Critique |
| US-ELV-06 | Élève | Voir les cours disponibles pour mes matières | Choisir le cours qui me convient | Critique |
| US-ELV-07 | Élève | M'inscrire à un cours en quelques clics | Gagner du temps | Critique |
| US-ELV-08 | Élève | Voir mon emploi du temps hebdomadaire | Organiser mon planning | Haute |
| US-ELV-09 | Élève | Consulter mes présences passées | Vérifier ma régularité | Haute |
| US-ELV-10 | Élève | Voir mes factures et reçus de paiement | Garder une trace de mes dépenses | Haute |
| US-ELV-11 | Élève | Télécharger les PDF et exercices de mes cours | Réviser à la maison | Haute |
| US-ELV-12 | Élève | Recevoir des notifications de rappel de cours | Ne pas oublier mes séances | Haute |
| US-ELV-13 | Élève | Évaluer mes enseignants après chaque cours | Donner mon feedback | Moyenne |
| US-ELV-14 | Élève | Voir le classement des enseignants | Choisir le meilleur enseignant | Moyenne |
| US-ELV-15 | Élève | Voir mon historique de cours | Suivre ma progression | Moyenne |
| US-ELV-16 | Élève | M'inscrire comme élève session unique pour un seul cours | Tester le centre avant de m'engager | Haute |
| US-ELV-17 | Élève | Être ajouté à une liste d'attente si le cours est complet | Être notifié quand une place se libère | Haute |

## 11.2 Parent

| ID | En tant que... | Je veux... | Afin de... | Priorité |
|----|---------------|-----------|------------|----------|
| US-PAR-01 | Parent | Voir les présences de mes enfants | Savoir s'ils assistent aux cours | Critique |
| US-PAR-02 | Parent | Recevoir les notifications de présence/absence | Être informé en temps réel | Haute |
| US-PAR-03 | Parent | Consulter les factures de mes enfants | Gérer mon budget | Critique |
| US-PAR-04 | Parent | Voir l'historique des paiements | Vérifier que tout est à jour | Haute |
| US-PAR-05 | Parent | Accepter ou refuser les inscriptions aux cours particuliers | Donner mon consentement | Critique |
| US-PAR-06 | Parent | Communiquer avec l'assistant via le chat | Poser des questions facilement | Haute |

## 11.3 Enseignant

| ID | En tant que... | Je veux... | Afin de... | Priorité |
|----|---------------|-----------|------------|----------|
| US-ENS-01 | Enseignant | Créer mon compte et être approuvé par l'admin | Accéder à la plateforme | Critique |
| US-ENS-02 | Enseignant | Renseigner mes disponibilités horaires | Être affecté aux bons créneaux | Critique |
| US-ENS-03 | Enseignant | Indiquer mon mode d'enseignement (en ligne/présentiel/les deux) | Correspondre aux besoins des cours | Critique |
| US-ENS-04 | Enseignant | Uploader des PDF, exercices, images et vidéos pour mes cours | Partager des ressources avec mes élèves | Critique |
| US-ENS-05 | Enseignant | Gérer mon emploi du temps | Voir mes cours à venir | Critique |
| US-ENS-06 | Enseignant | Voir mes groupes d'élèves assignés | Connaître ma classe | Haute |
| US-ENS-07 | Enseignant | Voir les présences de mes élèves | Suivre l'assiduité | Haute |
| US-ENS-08 | Enseignant | Voir mon revenu mensuel estimé | Anticiper mes gains | Haute |
| US-ENS-09 | Enseignant | Consulter mon historique de paiement | Suivre mes rémunérations | Haute |
| US-ENS-10 | Enseignant | Voir mes évaluations et commentaires | Améliorer ma pédagogie | Haute |
| US-ENS-11 | Enseignant | Accepter ou refuser un cours particulier à 2 élèves | Donner mon consentement | Critique |

## 11.4 Assistant

| ID | En tant que... | Je veux... | Afin de... | Priorité |
|----|---------------|-----------|------------|----------|
| US-AST-01 | Assistant | Gérer les inscriptions des élèves | Assurer le suivi administratif | Critique |
| US-AST-02 | Assistant | Enregistrer les paiements | Tenir la comptabilité à jour | Critique |
| US-AST-03 | Assistant | Générer et envoyer les factures | Assurer la facturation | Critique |
| US-AST-04 | Assistant | Gérer les groupes d'élèves | Organiser les classes | Haute |
| US-AST-05 | Assistant | Gérer la liste d'attente | Optimiser le remplissage | Haute |
| US-AST-06 | Assistant | Communiquer avec les parents et les enseignants via le chat | Faciliter les échanges | Haute |
| US-AST-07 | Assistant | Gérer les disponibilités des salles | Planifier les cours | Haute |
| US-AST-08 | Assistant | Gérer l'attribution et le suivi des cartes RFID | Assurer le pointage | Haute |
| US-AST-09 | Assistant | Enregistrer manuellement une présence si le RFID ne fonctionne pas | Assurer la continuité | Haute |
| US-AST-10 | Assistant | Voir le tableau de bord des présences du jour | Avoir une vue d'ensemble | Haute |

## 11.5 Administrateur

| ID | En tant que... | Je veux... | Afin de... | Priorité |
|----|---------------|-----------|------------|----------|
| US-ADM-01 | Administrateur | Voir un tableau de bord complet avec tous les KPI | Piloter l'établissement | Critique |
| US-ADM-02 | Administrateur | Gérer tous les utilisateurs (CRUD) | Administrer la plateforme | Critique |
| US-ADM-03 | Administrateur | Approuver ou rejeter les comptes enseignants et assistants | Contrôler les accès | Critique |
| US-ADM-04 | Administrateur | Créer et gérer les campagnes d'inscription | Organiser les sessions | Critique |
| US-ADM-05 | Administrateur | Configurer les niveaux scolaires et matières | Adapter le système au programme | Critique |
| US-ADM-06 | Administrateur | Générer des rapports PDF et Excel | Analyser l'activité | Haute |
| US-ADM-07 | Administrateur | Consulter les journaux d'audit | Assurer la traçabilité | Haute |
| US-ADM-08 | Administrateur | Configurer les paramètres système | Personnaliser la plateforme | Haute |
| US-ADM-09 | Administrateur | Gérer les permissions des rôles | Contrôler les accès précis | Haute |
| US-ADM-10 | Administrateur | Déclencher des sauvegardes manuelles | Protéger les données | Haute |
| US-ADM-11 | Administrateur | Configurer les sauvegardes automatiques | Automatiser la protection des données | Haute |
| US-ADM-12 | Administrateur | Gérer les salles et équipements | Planifier l'utilisation des ressources | Haute |
| US-ADM-13 | Administrateur | Modifier les permissions des rôles | Adapter les droits | Haute |
| US-ADM-14 | Administrateur | Voir le leaderboard des enseignants | Évaluer la performance pédagogique | Moyenne |

---

# 12. Règles de Gestion et Contraintes Métier

## 12.1 Règles de Gestion Identifiées

### RG-01 : Capacité des cours
- **Énoncé :** Un cours de type Normal ne peut excéder 30 élèves inscrits. Un cours VIP ne peut excéder 6 élèves. Un cours Particulier ne peut excéder 2 élèves.
- **Contrôle :** Vérification avant chaque inscription.
- **Sanction :** L'inscription est bloquée si la capacité maximale est atteinte.

### RG-02 : Conflit d'horaire enseignant
- **Énoncé :** Un enseignant ne peut pas être programmé sur deux cours simultanément.
- **Contrôle :** Vérification croisée des horaires avant création ou modification d'un cours.
- **Sanction :** Le système refuse la création/modification du cours et propose des alternatives.

### RG-03 : Conflit d'horaire salle
- **Énoncé :** Une salle ne peut pas être réservée pour deux cours simultanément.
- **Contrôle :** Vérification croisée des horaires avant réservation.
- **Sanction :** Le système refuse la réservation et propose des alternatives.

### RG-04 : Conflit d'horaire élève
- **Énoncé :** Un élève ne peut pas être inscrit à deux cours simultanément.
- **Contrôle :** Vérification avant inscription à un nouveau cours.
- **Sanction :** Le système refuse l'inscription et propose des alternatives.

### RG-05 : Validation des comptes enseignants/assistants
- **Énoncé :** Tout compte de type Enseignant ou Assistant créé via l'inscription en ligne doit être approuvé par un Administrateur avant de pouvoir accéder au système.
- **Contrôle :** Le compte est créé avec le statut « En attente ». L'accès est refusé tant que le statut n'est pas « Actif ».
- **Exception :** Les comptes créés directement par l'Administrateur peuvent être immédiatement actifs.

### RG-06 : Vérification email obligatoire
- **Énoncé :** Un élève doit vérifier son adresse email avant de pouvoir accéder aux fonctionnalités de la plateforme.
- **Contrôle :** Le statut « Email vérifié » est requis pour toute action autre que la modification du profil.
- **Délai :** Le lien de vérification expire après 24 heures.

### RG-07 : Approbation cours particulier 2 élèves
- **Énoncé :** Un cours particulier avec 2 élèves nécessite l'approbation explicite du parent du second élève et de l'enseignant.
- **Contrôle :** L'inscription est marquée « En attente d'approbation » tant que les deux approbations ne sont pas reçues.
- **Délai :** Les approbations doivent être données sous 48 heures, faute de quoi l'inscription est annulée.

### RG-08 : Délai de paiement
- **Énoncé :** Tout paiement mensuel doit être effectué au plus tard le 10 du mois concerné.
- **Contrôle :** Le système vérifie le statut de paiement lors du scan RFID.
- **Sanction :** Un avertissement est affiché lors du scan en cas de retard. Après 30 jours de retard, la carte RFID peut être désactivée par l'administrateur.

### RG-09 : Limite de téléversement
- **Énoncé :** La taille maximale des fichiers téléversés est de 50 Mo pour les documents et images, et de 200 Mo pour les vidéos.
- **Contrôle :** Vérification avant upload.
- **Sanction :** Le fichier est refusé si la limite est dépassée.

### RG-10 : Confidentialité des évaluations
- **Énoncé :** Les évaluations des enseignants par les élèves sont anonymes. L'enseignant peut voir sa note moyenne et ses commentaires mais pas l'identité des évaluateurs.
- **Contrôle :** La jointure entre l'évaluation et l'élève n'est accessible qu'à l'administrateur.

### RG-11 : Période d'évaluation
- **Énoncé :** Un élève ne peut évaluer un enseignant qu'après avoir assisté à au moins une séance avec cet enseignant.
- **Contrôle :** Vérification de la présence de l'élève à au moins un cours de l'enseignant.
- **Restriction :** Un élève ne peut évaluer un même enseignant qu'une seule fois par période (configurable).

### RG-12 : Gestion des campagnes
- **Énoncé :** Une campagne d'inscription a une date de début et une date de fin. Les inscriptions ne sont possibles que pendant cette période.
- **Contrôle :** Le système vérifie la date courante par rapport aux dates de la campagne.
- **Automatisme :** La campagne s'active et se désactive automatiquement.

### RG-13 : Numérotation des factures
- **Énoncé :** Les factures sont numérotées selon le format suivant : FAC-{AAAA}-{XXXXX} où AAAA est l'année et XXXXX un numéro séquentiel.
- **Contrôle :** Incrémentation automatique et garantie d'unicité.

### RG-14 : Désactivation RFID
- **Énoncé :** Une carte RFID peut être désactivée dans les cas suivants : (1) demande de l'élève, (2) perte/vol signalé, (3) inactivité prolongée (plus de 3 mois), (4) décision administrative.
- **Contrôle :** Seul un assistant ou un administrateur peut désactiver une carte.

### RG-15 : Âge minimum
- **Énoncé :** L'élève doit avoir au moins 5 ans pour s'inscrire (correspondant au début du primaire en Algérie).
- **Contrôle :** Validation de la date de naissance lors de l'inscription.

## 12.2 Contraintes Métier

| ID | Description | Source |
|----|-------------|--------|
| CM-01 | Conformité à la loi algérienne 18-07 sur la protection des données à caractère personnel | Législation |
| CM-02 | Conservation des données financières pendant 10 ans minimum | Obligation fiscale |
| CM-03 | Conservation des données des élèves pendant toute la durée de la scolarité + 5 ans | Politique interne |
| CM-04 | Interface en français obligatoire (arabe possible en V2) | Demande client |
| CM-05 | Support technique pendant les horaires d'ouverture du centre (samedi-jeudi, 8h-18h) | Contrat |
| CM-06 | Les prix des cours sont en Dinar Algérien (DZD) | Contexte local |
| CM-07 | Les noms des wilayas et communes doivent correspondre au découpage administratif algérien | Contexte local |

---

# 13. Diagrammes d'Activité

## 13.1 Diagramme d'Activité : Inscription d'un élève

Le flux d'inscription se déroule comme suit :

1. L'élève choisit le type d'inscription (Régulier ou Session unique)
2. L'élève remplit ses informations personnelles
3. Le système envoie un email de vérification
4. Une fois l'email vérifié, l'élève complète son profil
5. L'élève renseigne les informations de ses parents
6. L'élève choisit son niveau scolaire
7. L'élève sélectionne les matières souhaitées
8. L'élève choisit le type de cours (Normal, VIP, Particulier)
9. Le système vérifie la disponibilité des places :
   - Si places disponibles : vérification des conflits horaires
     - Si conflit : proposition de créneaux alternatifs
     - Si pas de conflit : confirmation de l'inscription
   - Si aucune place disponible : proposition d'inscription sur liste d'attente
10. Finalisation et envoi de la confirmation par email

## 13.2 Diagramme d'Activité : Scan RFID et pointage

1. L'élève scanne sa carte RFID à l'entrée du centre
2. Le système reçoit l'identifiant RFID
3. Le système recherche l'élève associé
4. Si l'élève est trouvé :
   a. Vérification du statut de la carte (active/inactive)
   b. Vérification de l'exhaustivité du profil
   c. Vérification du statut de paiement
   d. Vérification de l'inscription active à l'heure actuelle
5. Si toutes les vérifications sont réussies : enregistrement de la présence
6. Mise à jour du tableau de bord en temps réel
7. Affichage de la confirmation
8. En cas d'échec à une étape : affichage d'une alerte appropriée

## 13.3 Diagramme d'Activité : Gestion des conflits de planification

1. Saisie des informations du cours
2. Sélection de l'enseignant
3. Sélection de la salle
4. Définition des créneaux horaires
5. Vérification des conflits enseignant :
   - Si conflit : affichage des détails, proposition de créneaux disponibles
   - Si aucun conflit : poursuite
6. Vérification des conflits salle :
   - Si conflit : affichage des détails, proposition de salles alternatives
   - Si aucun conflit : poursuite
7. Enregistrement du cours
8. Mise à jour du calendrier
9. Notification des parties concernées

---

# 14. Diagrammes de Cas d'Utilisation

## 14.1 Diagramme Général

Le diagramme général contient les acteurs suivants :

1. **Visiteur** (non connecté)
2. **Élève** (connecté, email vérifié)
3. **Parent** (connecté, lié à un élève)
4. **Enseignant** (connecté, approuvé)
5. **Assistant** (connecté)
6. **Administrateur** (connecté)
7. **Système RFID** (acteur système)

Les cas d'utilisation sont organisés par paquetage fonctionnel :

**Paquetage Authentification :** Créer un compte, Se connecter, Se déconnecter, Réinitialiser mot de passe, Vérifier email

**Paquetage Inscriptions :** S'inscrire à un cours, Choisir niveau et matières, S'inscrire à la liste d'attente, Gérer les campagnes (Admin), Gérer les inscriptions (Assistant)

**Paquetage Cours et Planification :** Créer un cours, Modifier un cours, Supprimer un cours, Consulter emploi du temps, Gérer les salles

**Paquetage Présences :** Scanner RFID, Enregistrer présence manuelle, Consulter les présences, Gérer les cartes RFID

**Paquetage Finances :** Enregistrer un paiement, Générer facture, Consulter factures, Consulter historique paiements, Gérer les remboursements

**Paquetage Ressources :** Uploader des ressources, Télécharger des ressources, Organiser les ressources

**Paquetage Communication :** Envoyer un message, Consulter les notifications, Gérer les notifications

**Paquetage Évaluations :** Évaluer un enseignant, Consulter ses évaluations, Consulter le leaderboard

**Paquetage Administration :** Gérer les utilisateurs, Gérer les permissions, Consulter les logs, Configurer le système, Gérer les sauvegardes

## 14.2 Relations Acteurs

| Acteur | Hérite de | Relations |
|--------|-----------|-----------|
| Parent | (aucun) | Est associé à un ou plusieurs Élèves |
| Enseignant | (aucun) | Est associé à des Cours |
| Assistant | (aucun) | Effectue des actions administratives déléguées par Admin |
| Administrateur | (aucun) | Peut tout faire (extension de tous les acteurs) |
| Élève | (aucun) | Est associé à des Parents et à des Cours |
| Visiteur | (aucun) | Devient Élève après inscription |
| Système RFID | (aucun) | Acteur système, déclenche les cas d'utilisation de pointage |

---

# 15. Diagrammes de Séquence

## 15.1 Diagramme de Séquence : Inscription à un cours

```
Acteurs: Élève, Frontend, Backend, BD, Service Email

Élève -> Frontend: POST /api/courses/{id}/enroll
Frontend -> Backend: Requête d'inscription
Backend -> Backend: Valider token JWT
Backend -> BD: Vérifier disponibilité du cours
BD --> Backend: Places restantes
Backend -> BD: Vérifier conflits horaires élève
BD --> Backend: Aucun conflit
Backend -> BD: Créer inscription (statut: active)
BD --> Backend: Inscription créée
Backend -> BD: Mettre à jour compteur places
BD --> Backend: Compteur mis à jour
Backend -> Service Email: Envoyer confirmation inscription
Service Email --> Backend: Email envoyé
Backend -> Backend: Créer notification système
Backend --> Frontend: 201 Created (inscription réussie)
Frontend --> Élève: Afficher confirmation
```

## 15.2 Diagramme de Séquence : Scan RFID

```
Acteurs: Élève, Lecteur RFID, Backend, BD

Élève -> Lecteur RFID: Scanne sa carte
Lecteur RFID -> Backend: POST /api/attendance/scan {rfidTag}
Backend -> BD: Rechercher élève par RFID
BD --> Backend: Élève trouvé
Backend -> BD: Vérifier statut carte
BD --> Backend: Active
Backend -> BD: Vérifier profil complet
BD --> Backend: Complet
Backend -> BD: Vérifier statut paiement
BD --> Backend: À jour
Backend -> BD: Vérifier inscription active
BD --> Backend: Inscrit
Backend -> BD: Enregistrer présence
BD --> Backend: Présence enregistrée
Backend -> BD: Mettre à jour dashboard
BD --> Backend: Dashboard mis à jour
Backend --> Lecteur RFID: 200 OK
Lecteur RFID --> Élève: Afficher validation
```

## 15.3 Diagramme de Séquence : Paiement

```
Acteurs: Assistant, Frontend, Backend, BD, Service Email

Assistant -> Frontend: POST /api/payments
Frontend -> Backend: Requête paiement
Backend -> Backend: Valider token JWT
Backend -> BD: Vérifier élève et inscription
BD --> Backend: Élève trouvé
Backend -> BD: Enregistrer paiement
BD --> Backend: Paiement enregistré
Backend -> BD: Mettre à jour solde élève
BD --> Backend: Solde mis à jour
Backend -> Backend: Générer numéro de facture
Backend -> Backend: Générer PDF reçu
Backend -> Service Email: Envoyer reçu PDF
Service Email --> Backend: Email envoyé
Backend --> Frontend: 201 Created
Frontend --> Assistant: Afficher confirmation
```

## 15.4 Diagramme de Séquence : Création de cours

```
Acteurs: Admin, Frontend, Backend, BD

Admin -> Frontend: POST /api/courses
Frontend -> Backend: Requête création cours
Backend -> Backend: Valider token JWT + permissions
Backend -> BD: Vérifier disponibilité enseignant
BD --> Backend: Enseignant disponible
Backend -> BD: Vérifier disponibilité salle
BD --> Backend: Salle disponible
Backend -> BD: Créer le cours
BD --> Backend: Cours créé
Backend -> BD: Mettre à jour calendrier
BD --> Backend: Calendrier mis à jour
Backend --> Frontend: 201 Created
Frontend --> Admin: Afficher confirmation

alt Conflit enseignant
    Backend -> BD: Vérifier disponibilité enseignant
    BD --> Backend: Enseignant non disponible
    Backend --> Frontend: 409 Conflict
    Frontend --> Admin: Afficher erreur avec alternatives

alt Conflit salle
    Backend -> BD: Vérifier disponibilité salle
    BD --> Backend: Salle non disponible
    Backend --> Frontend: 409 Conflict
    Frontend --> Admin: Afficher erreur avec alternatives
```

---

# 16. Diagrammes de Classes

## 16.1 Classes Principales du Domaine

### Classe : User

| Attribut | Type | Contraintes | Description |
|----------|------|-------------|-------------|
| id | Long | PK, Auto-increment | Identifiant unique |
| firstName | String | Not null, max 50 | Prénom |
| lastName | String | Not null, max 50 | Nom |
| email | String | Not null, unique | Adresse email |
| password | String | Not null, min 8 | Mot de passe (hashé) |
| phone | String | max 20 | Numéro de téléphone |
| address | String | max 255 | Adresse postale |
| postalCode | String | max 10 | Code postal |
| city | String | max 50 | Commune |
| wilaya | String | max 50 | Wilaya |
| dateOfBirth | Date | | Date de naissance |
| role | Enum | Not null | ADMIN, ASSISTANT, TEACHER, STUDENT, PARENT |
| status | Enum | Not null | PENDING, ACTIVE, SUSPENDED, INACTIVE |
| emailVerified | Boolean | Default false | Email vérifié |
| photoUrl | String | | URL de la photo de profil |
| createdAt | DateTime | Not null | Date de création |
| updatedAt | DateTime | Not null | Date de mise à jour |

### Classe : Student (extends User)

| Attribut | Type | Contraintes |
|----------|------|-------------|
| studentType | Enum | REGULAR, SINGLE_SESSION |
| registrationNumber | String | Unique |
| schoolOrigin | String | max 100 |
| rfidTag | String | Unique |
| rfidAssignedAt | DateTime | |
| rfidStatus | Enum | ACTIVE, INACTIVE, LOST |

**Relations :** Parent (via StudentParent 1..*), Course (via CourseEnrollment 0..*), Attendance (0..*), Payment (0..*), Evaluation (0..*), WaitingList (0..*)

### Classe : Parent (extends User)

**Relations :** Student (via StudentParent 1..*)

### Classe : Teacher (extends User)

| Attribut | Type | Contraintes |
|----------|------|-------------|
| teachingMode | Enum | ONLINE, ONSITE, BOTH |
| biography | Text | |
| specialties | String | JSON array |
| rating | Float | Default 0 |
| ratingCount | Integer | Default 0 |

**Relations :** Course (0..*), Availability (0..*), Evaluation (0..*)

### Classe : Course

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| name | String | Not null |
| type | Enum | NORMAL, VIP, PRIVATE |
| capacity | Integer | Not null |
| price | BigDecimal | Not null |
| status | Enum | ACTIVE, INACTIVE, FULL, CANCELLED |
| startDate | Date | Not null |
| endDate | Date | Not null |

**Relations :** Subject (1), Level (1), Teacher (1), Room (1), CourseSchedule (1..*), CourseEnrollment (0..*), Resource (0..*)

### Classe : Subject

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| name | String | Not null, unique |
| description | Text | |

**Relations :** Level (via LevelSubject 0..*), Course (0..*)

### Classe : Level

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| name | String | Not null |
| category | Enum | PRIMARY, MIDDLE, HIGH_SCHOOL |
| stream | String | Filière |
| year | Integer | |

**Relations :** Subject (via LevelSubject 0..*), Course (0..*)

### Classe : Room

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| name | String | Not null, unique |
| capacity | Integer | Not null |
| floor | Integer | |
| equipment | String | JSON array |
| status | Enum | ACTIVE, MAINTENANCE, INACTIVE |

### Classe : CourseSchedule

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| courseId | Long | FK |
| dayOfWeek | Enum | Not null |
| startTime | Time | Not null |
| endTime | Time | Not null |
| roomId | Long | FK (nullable) |

### Classe : CourseEnrollment

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| studentId | Long | FK |
| courseId | Long | FK |
| enrollmentDate | DateTime | Not null |
| status | Enum | ACTIVE, PENDING_APPROVAL, COMPLETED, CANCELLED |
| campaignId | Long | FK |

### Classe : Attendance

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| studentId | Long | FK |
| courseScheduleId | Long | FK |
| date | Date | Not null |
| checkInTime | DateTime | |
| method | Enum | RFID, MANUAL |
| status | Enum | PRESENT, ABSENT, LATE |

### Classe : Payment

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| studentId | Long | FK |
| amount | BigDecimal | Not null |
| paymentDate | DateTime | Not null |
| paymentMethod | Enum | CASH, BANK_TRANSFER, CARD, CHECK |
| paymentType | Enum | MONTHLY, PER_SESSION, VIP, PRIVATE |
| receiptNumber | String | Unique |
| recordedById | Long | FK |

### Classe : Invoice

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| invoiceNumber | String | Unique |
| studentId | Long | FK |
| issueDate | Date | Not null |
| dueDate | Date | Not null |
| totalAmount | BigDecimal | Not null |
| status | Enum | PAID, UNPAID, PARTIALLY_PAID, CANCELLED |

### Classe : Evaluation

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| studentId | Long | FK |
| teacherId | Long | FK |
| teachingQuality | Integer | 1-5 |
| communication | Integer | 1-5 |
| punctuality | Integer | 1-5 |
| organization | Integer | 1-5 |
| averageScore | Float | Calculé |
| comment | Text | |

### Classe : Resource

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| courseId | Long | FK |
| title | String | Not null |
| type | Enum | PDF, EXERCISE, IMAGE, VIDEO, LINK |
| fileUrl | String | |
| uploadedById | Long | FK |

### Classe : Notification

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| userId | Long | FK |
| title | String | Not null |
| message | Text | Not null |
| type | Enum | INFO, WARNING, SUCCESS, ERROR |
| category | Enum | PAYMENT, COURSE, ATTENDANCE, SYSTEM |
| isRead | Boolean | Default false |

### Classe : Message

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| senderId | Long | FK |
| receiverId | Long | FK |
| subject | String | max 200 |
| body | Text | Not null |
| isRead | Boolean | Default false |
| parentMessageId | Long | FK |

### Classe : Campaign

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| name | String | Not null |
| description | Text | |
| startDate | DateTime | Not null |
| endDate | DateTime | Not null |
| isActive | Boolean | Default true |
| maxSeats | Integer | |

### Classe : WaitingList

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| studentId | Long | FK |
| courseId | Long | FK |
| registeredAt | DateTime | Not null |
| status | Enum | WAITING, NOTIFIED, ENROLLED, EXPIRED |

### Classe : AuditLog

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| userId | Long | FK |
| action | String | Not null |
| entityType | String | Not null |
| entityId | Long | |
| oldValue | Text | JSON |
| newValue | Text | JSON |
| ipAddress | String | |
| createdAt | DateTime | Not null |

### Classe : TeacherAvailability

| Attribut | Type | Contraintes |
|----------|------|-------------|
| id | Long | PK |
| teacherId | Long | FK |
| dayOfWeek | Enum | Not null |
| startTime | Time | Not null |
| endTime | Time | Not null |

---

# 17. Modèle Conceptuel de Données (MCD)

## 17.1 Entités et Associations Principales

### Entités Fortes

| Entité | Description | Identifiant |
|--------|-------------|-------------|
| USER | Personne physique utilisant le système | id (PK) |
| COURSE | Cours de soutien scolaire | id (PK) |
| SUBJECT | Matière enseignée | id (PK) |
| LEVEL | Niveau scolaire | id (PK) |
| ROOM | Salle de cours | id (PK) |
| CAMPAIGN | Campagne d'inscription | id (PK) |

### Entités Faibles / Associations

| Entité | Description | Identifiant |
|--------|-------------|-------------|
| STUDENT | Spécialisation de USER (Élève) | id (FK vers USER) |
| PARENT | Spécialisation de USER (Parent) | id (FK vers USER) |
| TEACHER | Spécialisation de USER (Enseignant) | id (FK vers USER) |
| ASSISTANT | Spécialisation de USER (Assistant) | id (FK vers USER) |
| ADMIN | Spécialisation de USER (Admin) | id (FK vers USER) |
| STUDENT_PARENT | Association Élève-Parent | id (PK) |
| LEVEL_SUBJECT | Association Niveau-Matière | id (PK) |
| COURSE_ENROLLMENT | Inscription d'un élève à un cours | id (PK) |
| COURSE_SCHEDULE | Séance programmée d'un cours | id (PK) |
| ATTENDANCE | Présence d'un élève à une séance | id (PK) |
| PAYMENT | Paiement effectué | id (PK) |
| INVOICE | Facture émise | id (PK) |
| RESOURCE | Ressource pédagogique | id (PK) |
| EVALUATION | Évaluation d'un enseignant | id (PK) |
| NOTIFICATION | Notification envoyée | id (PK) |
| MESSAGE | Message interne | id (PK) |
| WAITING_LIST | Inscription en liste d'attente | id (PK) |
| AUDIT_LOG | Trace d'audit | id (PK) |
| TEACHER_AVAILABILITY | Disponibilité d'un enseignant | id (PK) |
| BACKUP | Sauvegarde du système | id (PK) |

## 17.2 Associations et Cardinaux

| Association | Entité A | Card. A | Entité B | Card. B | Description |
|-------------|----------|---------|----------|---------|-------------|
| EST_INSCRIT | STUDENT | 0..* | COURSE | 0..* | Via COURSE_ENROLLMENT |
| ENSEIGNE | TEACHER | 1 | COURSE | 0..* | Un enseignant donne plusieurs cours |
| A_LIEU_DANS | COURSE | 1 | ROOM | 0..* | Un cours a lieu dans une salle |
| SE_COMPOSE | LEVEL | 1 | SUBJECT | 0..* | Via LEVEL_SUBJECT |
| APPARTIENT | STUDENT | 1..* | PARENT | 1..* | Via STUDENT_PARENT |
| GENERE | PAYMENT | 1 | INVOICE | 1 | Un paiement génère une facture |
| EFFECTUE | STUDENT | 1 | PAYMENT | 0..* | Un élève effectue des paiements |
| ASSISTE | STUDENT | 0..* | COURSE_SCHEDULE | 0..* | Via ATTENDANCE |
| EVALUE | STUDENT | 0..* | TEACHER | 0..* | Via EVALUATION |
| TELECHARGE | TEACHER | 1 | RESOURCE | 0..* | Un enseignant upload des ressources |
| ENVOIE | USER | 1 | MESSAGE | 0..* | Un utilisateur envoie des messages |
| REÇOIT | USER | 1 | NOTIFICATION | 0..* | Un utilisateur reçoit des notifications |
| ATTEND | STUDENT | 0..* | COURSE | 0..* | Via WAITING_LIST |
| CONCERNE | CAMPAIGN | 0..* | COURSE | 0..* | Une campagne concerne des cours |
| DISPONIBLE | TEACHER | 1 | TEACHER_AVAILABILITY | 0..* | Créneaux de disponibilité |

---
