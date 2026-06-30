# Cahier des Charges Fonctionnel et Technique — Partie 3

---

# 18. Schéma de Base de Données

## 18.1 Choix du SGBD

**SGBD choisi : PostgreSQL 16**

**Justification :**
- Base de données relationnelle open source la plus avancée
- Support natif des types JSON, tableaux et range types pour la gestion des plages horaires
- Performance élevée avec indexation avancée (GIN, GiST, BRIN)
- Réplication native et Point-In-Time Recovery pour la sauvegarde
- Extensions utiles : pg_cron pour les tâches planifiées, pgcrypto pour le chiffrement
- Excellent support des transactions ACID
- Communauté active et documentation riche

## 18.2 Enum Types

| Nom | Valeurs |
|----|---------|
| user_role | ADMIN, ASSISTANT, TEACHER, STUDENT, PARENT |
| user_status | PENDING, ACTIVE, SUSPENDED, INACTIVE |
| student_type | REGULAR, SINGLE_SESSION |
| rfid_status | ACTIVE, INACTIVE, LOST |
| teaching_mode | ONLINE, ONSITE, BOTH |
| course_type | NORMAL, VIP, PRIVATE |
| course_status | ACTIVE, INACTIVE, FULL, CANCELLED |
| enrollment_status | ACTIVE, PENDING_APPROVAL, COMPLETED, CANCELLED |
| attendance_method | RFID, MANUAL |
| attendance_status | PRESENT, ABSENT, LATE |
| payment_method | CASH, BANK_TRANSFER, CARD, CHECK |
| payment_type | MONTHLY, PER_SESSION, VIP, PRIVATE |
| invoice_status | PAID, UNPAID, PARTIALLY_PAID, CANCELLED |
| resource_type | PDF, EXERCISE, IMAGE, VIDEO, LINK |
| notification_type | INFO, WARNING, SUCCESS, ERROR |
| notification_category | PAYMENT, COURSE, ATTENDANCE, SYSTEM, REGISTRATION |
| waiting_list_status | WAITING, NOTIFIED, ENROLLED, EXPIRED |
| backup_type | AUTOMATIC, MANUAL |
| backup_status | IN_PROGRESS, COMPLETED, FAILED |
| room_status | ACTIVE, MAINTENANCE, INACTIVE |
| day_of_week | MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY |
| level_category | PRIMARY, MIDDLE, HIGH_SCHOOL |

## 18.3 Structure des Tables Principales

### Table : users (Utilisateurs)

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| first_name | VARCHAR(50) | NOT NULL |
| last_name | VARCHAR(50) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(20) | |
| address | VARCHAR(255) | |
| postal_code | VARCHAR(10) | |
| city | VARCHAR(50) | |
| wilaya | VARCHAR(50) | |
| date_of_birth | DATE | |
| role | user_role | NOT NULL |
| status | user_status | NOT NULL, DEFAULT 'PENDING' |
| email_verified | BOOLEAN | DEFAULT FALSE |
| email_verified_at | TIMESTAMP | |
| photo_url | VARCHAR(500) | |
| last_login_at | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

**Index :** email, role, status

### Table : students

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGINT | PK, FK vers users(id) CASCADE |
| student_type | student_type | DEFAULT 'REGULAR' |
| registration_number | VARCHAR(50) | NOT NULL, UNIQUE |
| school_origin | VARCHAR(100) | |
| rfid_tag | VARCHAR(100) | UNIQUE |
| rfid_assigned_at | TIMESTAMP | |
| rfid_status | rfid_status | DEFAULT 'INACTIVE' |

**Index :** rfid_tag, registration_number

### Table : student_parent

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| student_id | BIGINT | FK, NOT NULL |
| parent_id | BIGINT | FK, NOT NULL |
| relationship | VARCHAR(50) | |
| UNIQUE(student_id, parent_id) | | |

### Table : teachers

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGINT | PK, FK vers users(id) CASCADE |
| teaching_mode | teaching_mode | DEFAULT 'ONSITE' |
| biography | TEXT | |
| specialties | JSONB | DEFAULT '[]' |
| rating | DECIMAL(3,2) | DEFAULT 0 |
| rating_count | INTEGER | DEFAULT 0 |

### Table : teacher_availability

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| teacher_id | BIGINT | FK, NOT NULL |
| day_of_week | day_of_week | NOT NULL |
| start_time | TIME | NOT NULL |
| end_time | TIME | NOT NULL |
| CHECK (start_time < end_time) | | |

### Table : levels

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(100) | NOT NULL |
| category | level_category | NOT NULL |
| stream | VARCHAR(100) | |
| year | INTEGER | |
| sort_order | INTEGER | DEFAULT 0 |

### Table : subjects

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| description | TEXT | |

### Table : level_subject

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| level_id | BIGINT | FK, NOT NULL |
| subject_id | BIGINT | FK, NOT NULL |
| UNIQUE(level_id, subject_id) | | |

### Table : rooms

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(100) | NOT NULL, UNIQUE |
| capacity | INTEGER | NOT NULL, CHECK > 0 |
| floor | INTEGER | |
| equipment | JSONB | DEFAULT '[]' |
| status | room_status | DEFAULT 'ACTIVE' |

### Table : courses

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(200) | NOT NULL |
| type | course_type | DEFAULT 'NORMAL' |
| capacity | INTEGER | NOT NULL, CHECK > 0 |
| current_enrollments | INTEGER | DEFAULT 0 |
| price | DECIMAL(10,2) | NOT NULL |
| status | course_status | DEFAULT 'ACTIVE' |
| start_date | DATE | NOT NULL |
| end_date | DATE | NOT NULL |
| description | TEXT | |
| subject_id | BIGINT | FK, NOT NULL |
| level_id | BIGINT | FK, NOT NULL |
| teacher_id | BIGINT | FK, NOT NULL |
| room_id | BIGINT | FK |
| CHECK (end_date >= start_date) | | |
| CHECK (current_enrollments <= capacity) | | |

**Index :** teacher_id, subject_id, level_id, status, type

### Table : course_schedules

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| course_id | BIGINT | FK, NOT NULL |
| day_of_week | day_of_week | NOT NULL |
| start_time | TIME | NOT NULL |
| end_time | TIME | NOT NULL |
| room_id | BIGINT | FK |
| CHECK (start_time < end_time) | | |

### Table : course_enrollments

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| student_id | BIGINT | FK, NOT NULL |
| course_id | BIGINT | FK, NOT NULL |
| enrollment_date | TIMESTAMP | DEFAULT NOW() |
| status | enrollment_status | DEFAULT 'ACTIVE' |
| campaign_id | BIGINT | FK |
| approved_by_parent | BOOLEAN | DEFAULT FALSE |
| approved_by_teacher | BOOLEAN | DEFAULT FALSE |
| UNIQUE(student_id, course_id) | | |

### Table : attendance

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| student_id | BIGINT | FK, NOT NULL |
| course_schedule_id | BIGINT | FK, NOT NULL |
| date | DATE | NOT NULL |
| check_in_time | TIMESTAMP | |
| method | attendance_method | DEFAULT 'RFID' |
| status | attendance_status | DEFAULT 'ABSENT' |
| notes | VARCHAR(255) | |
| recorded_by | BIGINT | FK |
| UNIQUE(student_id, course_schedule_id, date) | | |

### Table : payments

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| student_id | BIGINT | FK, NOT NULL |
| amount | DECIMAL(10,2) | NOT NULL, CHECK > 0 |
| payment_date | TIMESTAMP | DEFAULT NOW() |
| payment_method | payment_method | NOT NULL |
| payment_type | payment_type | NOT NULL |
| reference | VARCHAR(100) | |
| receipt_number | VARCHAR(50) | UNIQUE, NOT NULL |
| notes | VARCHAR(500) | |
| recorded_by | BIGINT | FK, NOT NULL |
| related_course_id | BIGINT | FK |

### Table : invoices

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| invoice_number | VARCHAR(50) | UNIQUE, NOT NULL |
| student_id | BIGINT | FK, NOT NULL |
| issue_date | DATE | DEFAULT CURRENT_DATE |
| due_date | DATE | NOT NULL |
| total_amount | DECIMAL(10,2) | NOT NULL |
| paid_amount | DECIMAL(10,2) | DEFAULT 0 |
| status | invoice_status | DEFAULT 'UNPAID' |
| pdf_url | VARCHAR(500) | |
| notes | TEXT | |

### Table : resources

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| course_id | BIGINT | FK, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| type | resource_type | NOT NULL |
| file_url | VARCHAR(500) | |
| external_url | VARCHAR(500) | |
| file_size | BIGINT | |
| mime_type | VARCHAR(100) | |
| description | TEXT | |
| uploaded_by | BIGINT | FK, NOT NULL |

### Table : evaluations

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| student_id | BIGINT | FK, NOT NULL |
| teacher_id | BIGINT | FK, NOT NULL |
| teaching_quality | INTEGER | CHECK 1-5 |
| communication | INTEGER | CHECK 1-5 |
| punctuality | INTEGER | CHECK 1-5 |
| organization | INTEGER | CHECK 1-5 |
| average_score | DECIMAL(3,2) | GENERATED ALWAYS AS (teaching_quality + communication + punctuality + organization) / 4 STORED |
| comment | TEXT | |
| UNIQUE(student_id, teacher_id) | | |

### Table : notifications

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | FK, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| message | TEXT | NOT NULL |
| type | notification_type | DEFAULT 'INFO' |
| category | notification_category | DEFAULT 'SYSTEM' |
| is_read | BOOLEAN | DEFAULT FALSE |
| read_at | TIMESTAMP | |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Table : messages

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| sender_id | BIGINT | FK, NOT NULL |
| receiver_id | BIGINT | FK, NOT NULL |
| subject | VARCHAR(200) | |
| body | TEXT | NOT NULL |
| is_read | BOOLEAN | DEFAULT FALSE |
| parent_message_id | BIGINT | FK |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Table : campaigns

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| name | VARCHAR(200) | NOT NULL |
| description | TEXT | |
| start_date | TIMESTAMP | NOT NULL |
| end_date | TIMESTAMP | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| max_seats | INTEGER | |
| created_by | BIGINT | FK |
| CHECK (end_date > start_date) | | |

### Table : waiting_list

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| student_id | BIGINT | FK, NOT NULL |
| course_id | BIGINT | FK, NOT NULL |
| registered_at | TIMESTAMP | DEFAULT NOW() |
| notified_at | TIMESTAMP | |
| status | waiting_list_status | DEFAULT 'WAITING' |

### Table : audit_logs

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| user_id | BIGINT | FK |
| action | VARCHAR(255) | NOT NULL |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | BIGINT | |
| old_value | TEXT | |
| new_value | TEXT | |
| ip_address | VARCHAR(45) | |
| user_agent | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Table : backups

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | BIGSERIAL | PK |
| file_name | VARCHAR(255) | NOT NULL |
| file_size | BIGINT | |
| type | backup_type | NOT NULL |
| status | backup_status | DEFAULT 'IN_PROGRESS' |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

# 19. Spécification de l'API REST

## 19.1 Principes Généraux

- **Format :** RESTful API avec JSON
- **Base URL :** `/api/v1`
- **Authentification :** JWT Bearer Token dans le header `Authorization`
- **Content-Type :** `application/json`
- **Paginated responses :** Support cursor-based et offset-based pagination
- **Versioning :** Via URL path (v1, v2, etc.)
- **Documentation :** OpenAPI 3.1 (Swagger)

## 19.2 Endpoints Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | /api/v1/auth/register | Créer un compte | Non |
| POST | /api/v1/auth/login | Se connecter | Non |
| POST | /api/v1/auth/logout | Se déconnecter | Oui |
| POST | /api/v1/auth/verify-email | Vérifier email | Non |
| POST | /api/v1/auth/forgot-password | Demander réinitialisation | Non |
| POST | /api/v1/auth/reset-password | Réinitialiser mot de passe | Non |
| POST | /api/v1/auth/refresh-token | Rafraîchir token JWT | Oui |
| GET | /api/v1/auth/me | Profil utilisateur connecté | Oui |

## 19.3 Endpoints Utilisateurs

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | /api/v1/users | Liste des utilisateurs | ADMIN |
| GET | /api/v1/users/:id | Détail d'un utilisateur | ADMIN |
| PUT | /api/v1/users/:id | Modifier un utilisateur | ADMIN |
| DELETE | /api/v1/users/:id | Supprimer un utilisateur | ADMIN |
| PUT | /api/v1/users/:id/approve | Approuver un compte | ADMIN |
| PUT | /api/v1/users/:id/suspend | Suspendre un compte | ADMIN |
| GET | /api/v1/users/pending | Comptes en attente | ADMIN |
| GET | /api/v1/students/:id/parents | Parents d'un élève | ADMIN, ASSISTANT |
| POST | /api/v1/students/:id/parents | Ajouter un parent | ADMIN, ASSISTANT |
| PUT | /api/v1/profile | Modifier son profil | Tous |
| PUT | /api/v1/profile/parents | Infos parents (élève) | STUDENT |

## 19.4 Endpoints Cours

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | /api/v1/courses | Liste des cours | Tous |
| GET | /api/v1/courses/:id | Détail d'un cours | Tous |
| POST | /api/v1/courses | Créer un cours | ADMIN, ASSISTANT |
| PUT | /api/v1/courses/:id | Modifier un cours | ADMIN, ASSISTANT |
| DELETE | /api/v1/courses/:id | Supprimer un cours | ADMIN |
| GET | /api/v1/courses/:id/enrollments | Inscriptions au cours | ADMIN, ASSISTANT, TEACHER |
| POST | /api/v1/courses/:id/enroll | S'inscrire à un cours | STUDENT |
| POST | /api/v1/courses/:id/waiting-list | Liste d'attente | STUDENT |
| GET | /api/v1/courses/available | Cours disponibles | STUDENT |

## 19.5 Endpoints Planification

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | /api/v1/schedules | Créer une séance | ADMIN, ASSISTANT |
| PUT | /api/v1/schedules/:id | Modifier une séance | ADMIN, ASSISTANT |
| DELETE | /api/v1/schedules/:id | Supprimer une séance | ADMIN |
| GET | /api/v1/schedules/check-conflicts | Vérifier conflits | ADMIN, ASSISTANT |
| GET | /api/v1/calendar/student/:id | Calendrier élève | STUDENT, PARENT |
| GET | /api/v1/calendar/teacher/:id | Calendrier enseignant | TEACHER, ADMIN |
| GET | /api/v1/calendar/room/:id | Calendrier salle | ADMIN, ASSISTANT |

## 19.6 Endpoints Présences

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | /api/v1/attendance/scan | Scan RFID | RFID_SYSTEM, ASSISTANT |
| POST | /api/v1/attendance/manual | Présence manuelle | ASSISTANT |
| GET | /api/v1/attendance/student/:id | Présences d'un élève | STUDENT, PARENT, TEACHER, ADMIN |
| GET | /api/v1/attendance/course/:id | Présences d'un cours | TEACHER, ADMIN |
| GET | /api/v1/attendance/today | Présences du jour | ASSISTANT, ADMIN |
| PUT | /api/v1/students/:id/rfid | Associer carte RFID | ADMIN, ASSISTANT |
| PUT | /api/v1/students/:id/rfid/status | Changer statut RFID | ADMIN, ASSISTANT |

## 19.7 Endpoints Finances

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | /api/v1/payments | Enregistrer paiement | ADMIN, ASSISTANT |
| GET | /api/v1/payments/student/:id | Paiements d'un élève | ADMIN, ASSISTANT, STUDENT, PARENT |
| GET | /api/v1/payments/:id | Détail d'un paiement | ADMIN, ASSISTANT |
| GET | /api/v1/invoices/student/:id | Factures d'un élève | STUDENT, PARENT, ADMIN |
| GET | /api/v1/invoices/:id/pdf | Télécharger facture PDF | STUDENT, PARENT, ADMIN |
| POST | /api/v1/invoices/generate | Générer factures | ADMIN, ASSISTANT |
| GET | /api/v1/teacher/:id/earnings | Revenus enseignant | TEACHER, ADMIN |

## 19.8 Endpoints Ressources

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | /api/v1/resources | Uploader ressource | TEACHER |
| GET | /api/v1/resources/course/:id | Ressources d'un cours | STUDENT, TEACHER, ADMIN |
| DELETE | /api/v1/resources/:id | Supprimer ressource | TEACHER, ADMIN |
| GET | /api/v1/resources/:id/download | Télécharger ressource | STUDENT, TEACHER |

## 19.9 Endpoints Communication

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | /api/v1/messages | Messages reçus | Tous |
| POST | /api/v1/messages | Envoyer message | Tous |
| GET | /api/v1/messages/:id | Détail message | Tous |
| PUT | /api/v1/messages/:id/read | Marquer comme lu | Tous |
| GET | /api/v1/notifications | Notifications | Tous |
| PUT | /api/v1/notifications/:id/read | Marquer notification lue | Tous |
| PUT | /api/v1/notifications/read-all | Tout marquer comme lu | Tous |

## 19.10 Endpoints Évaluations

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| POST | /api/v1/evaluations | Évaluer un enseignant | STUDENT |
| GET | /api/v1/evaluations/teacher/:id | Évaluations d'un enseignant | TEACHER, ADMIN |
| GET | /api/v1/leaderboard | Classement enseignants | STUDENT, ADMIN |

## 19.11 Endpoints Administration

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| GET | /api/v1/dashboard | Tableau de bord | ADMIN |
| GET | /api/v1/dashboard/teacher | Dashboard enseignant | TEACHER |
| GET | /api/v1/dashboard/assistant | Dashboard assistant | ASSISTANT |
| GET | /api/v1/dashboard/student | Dashboard élève | STUDENT |
| GET | /api/v1/dashboard/parent | Dashboard parent | PARENT |
| GET | /api/v1/reports/financial | Rapport financier | ADMIN |
| GET | /api/v1/reports/attendance | Rapport fréquentation | ADMIN |
| GET | /api/v1/reports/:id/export | Exporter rapport PDF/Excel | ADMIN |
| GET | /api/v1/audit-logs | Journaux d'audit | ADMIN |
| POST | /api/v1/backups | Déclencher sauvegarde | ADMIN |
| GET | /api/v1/backups | Liste des sauvegardes | ADMIN |
| POST | /api/v1/backups/:id/restore | Restaurer sauvegarde | ADMIN |
| GET | /api/v1/levels | Niveaux scolaires | ADMIN |
| POST | /api/v1/levels | Créer niveau | ADMIN |
| GET | /api/v1/subjects | Matières | ADMIN |
| POST | /api/v1/subjects | Créer matière | ADMIN |
| GET | /api/v1/rooms | Salles | ADMIN, ASSISTANT |
| POST | /api/v1/rooms | Créer salle | ADMIN |
| POST | /api/v1/campaigns | Créer campagne | ADMIN |
| GET | /api/v1/campaigns | Liste campagnes | ADMIN, STUDENT |
| PUT | /api/v1/settings | Configurer système | ADMIN |
| GET | /api/v1/settings | Paramètres système | ADMIN |

## 19.12 Structure des Réponses

### Succès

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Erreur

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description de l'erreur en français",
    "details": [
      { "field": "email", "message": "L'email est déjà utilisé" }
    ]
  }
}
```

---

# 20. Architecture Frontend

## 20.1 Choix Technologiques

| Technologie | Version | Justification |
|-------------|---------|---------------|
| React | 18.x | Bibliothèque UI mature, large communauté, écosystème riche |
| TypeScript | 5.x | Typage statique, maintenance, robustesse |
| Next.js | 14.x | SSR, SSR, routing, SEO-friendly pour pages publiques |
| Tailwind CSS | 3.x | Utility-first, rapidité de développement, responsive |
| Shadcn/ui | Latest | Composants réutilisables, accessibles, personnalisables |
| React Query (TanStack) | 5.x | Gestion des états serveur, caching, polling |
| Zustand | 4.x | Gestion d'état globale légère |
| React Hook Form | 7.x | Gestion des formulaires performante |
| Zod | 3.x | Validation de schémas côté client |
| Axios | 1.x | Client HTTP avec intercepteurs |
| date-fns | 3.x | Manipulation de dates légère |
| Recharts | 2.x | Graphiques et visualisations |
| React Big Calendar | 1.x | Calendrier interactif |

## 20.2 Architecture des Composants

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/             # Pages publiques
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── (dashboard)/        # Pages authentifiées
│   │   ├── admin/
│   │   ├── assistant/
│   │   ├── teacher/
│   │   ├── student/
│   │   └── parent/
│   └── api/                # Routes API Next.js
├── components/             # Composants React
│   ├── ui/                 # Composants atomiques (Shadcn)
│   ├── forms/              # Formulaires complexes
│   ├── layout/             # Layout, sidebar, header
│   ├── dashboard/          # Widgets de dashboard
│   ├── calendar/           # Composants calendrier
│   ├── chat/               # Messagerie
│   └── common/             # Composants partagés
├── hooks/                  # Custom hooks
├── lib/                    # Utilitaires, helpers
├── services/               # Appels API (React Query)
├── stores/                 # États globaux (Zustand)
├── types/                  # Types TypeScript
└── validations/            # Schémas Zod
```

## 20.3 Principes d'Architecture

- **Composants atomiques** : Bibliothèque de composants UI réutilisables
- **Séparation des responsabilités** : Pages / Composants / Hooks / Services
- **Server Components** : Utilisation des React Server Components pour les pages statiques
- **Client Components** : Composants interactifs marqués 'use client'
- **Middleware** : Vérification d'authentification et redirection côté serveur
- **Intercepteurs Axios** : Gestion centralisée des tokens JWT et erreurs 401
- **Lazy loading** : Code splitting par route avec Next.js dynamic imports

---

# 21. Architecture Backend

## 21.1 Choix Technologiques

| Technologie | Version | Justification |
|-------------|---------|---------------|
| Node.js | 20 LTS | JavaScript runtime, performance, écosystème |
| NestJS | 10.x | Framework backend structuré (controllers, services, modules) |
| TypeScript | 5.x | Typage statique, maintenabilité |
| TypeORM | 0.3.x | ORM TypeScript, support PostgreSQL, migrations |
| PostgreSQL | 16 | Base de données relationnelle |
| Redis | 7.x | Cache, sessions, files d'attente |
| Bull | 4.x | File d'attente de tâches (notifications, emails, PDF) |
| Passport.js | Latest | Stratégies d'authentification (JWT) |
| Joi / class-validator | Latest | Validation des DTO |
| Winston | 3.x | Logging structuré |
| Swagger | Latest | Documentation API automatique |
| Jest | 29.x | Tests unitaires et d'intégration |
| Docker | Latest | Conteneurisation |

## 21.2 Architecture en Couches

```
src/
├── modules/                    # Modules fonctionnels
│   ├── auth/                   # Authentification
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── strategies/
│   │   └── auth.module.ts
│   ├── users/                  # Gestion des utilisateurs
│   ├── courses/                # Cours et planification
│   ├── attendance/             # Présences RFID
│   ├── payments/               # Paiements et factures
│   ├── resources/              # Ressources pédagogiques
│   ├── messaging/              # Messagerie et notifications
│   ├── evaluations/            # Évaluations et classements
│   ├── dashboard/              # Tableaux de bord
│   ├── reports/                # Rapports
│   ├── campaigns/              # Campagnes d'inscription
│   ├── rooms/                  # Gestion des salles
│   ├── schedule/               # Planification intelligente
│   └── admin/                  # Administration système
├── common/                     # Code partagé
│   ├── guards/                 # Guards RBAC
│   ├── decorators/             # Decorators personnalisés
│   ├── filters/                # Filtres d'exception
│   ├── interceptors/           # Intercepteurs
│   ├── pipes/                  # Pipes de validation
│   ├── middleware/              # Middleware
│   └── utils/                  # Utilitaires
├── config/                     # Configuration
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
├── database/                   # Migrations et seeds
│   ├── migrations/
│   └── seeds/
└── main.ts                     # Point d'entrée
```

## 21.3 Principes d'Architecture Backend

- **Modularité** : Chaque fonctionnalité est un module NestJS indépendant
- **Séparation des responsabilités** : Controller (HTTP) → Service (métier) → Repository (données)
- **Injection de dépendances** : IoC container de NestJS
- **DTOs** : Validation des entrées avec class-validator
- **Guards** : Protection RBAC sur chaque endpoint
- **Interceptors** : Logging, transformation des réponses, gestion des temps de réponse
- **Filters** : Gestion centralisée des exceptions
- **Queues** : Tâches asynchrones avec Bull (envoi d'emails, génération PDF)
- **Caching** : Redis pour les données fréquemment accédées

---

# 22. Architecture de Sécurité

## 22.1 Authentification

- **JWT (JSON Web Token)** : Tokens d'accès et de refresh
  - Access token : durée de vie 15 minutes
  - Refresh token : durée de vie 7 jours, stocké en base
  - Rotation des refresh tokens à chaque utilisation
- **Hash des mots de passe** : bcrypt avec coût 12 ou argon2
- **Rate limiting** : 5 tentatives de connexion par minute par IP
- **Lockout** : Compte verrouillé après 10 tentatives échouées (durée : 30 minutes)
- **2FA** : Optionnel via OTP/TOTP (envisagé en V2)

## 22.2 Contrôle d'Accès (RBAC)

```
Permissions par rôle :

ADMIN       : Toutes les permissions (CRUD sur tout)
ASSISTANT   : Gestion inscriptions, paiements, présences, salles, messagerie
TEACHER     : Gestion cours assignés, ressources, consultations
STUDENT     : Inscription, consultation, téléchargement, évaluation
PARENT      : Consultation enfants, messagerie assistant, approbation
```

- Vérification côté serveur sur chaque endpoint via des guards
- Middleware côté frontend pour le routage conditionnel
- Journalisation de toutes les actions sensibles

## 22.3 Protection des Données

- **En transit** : HTTPS/TLS 1.3 obligatoire
- **Au repos** : Chiffrement AES-256 des données sensibles (coordonnées bancaires, données personnelles)
- **Base de données** : Chiffrement au niveau disque (LUKS)
- **Backups** : Chiffrement des fichiers de sauvegarde

## 22.4 Protection Contre les Attaques

| Attaque | Protection |
|---------|-----------|
| XSS | Content Security Policy (CSP), échappement HTML, React auto-échappe |
| CSRF | Tokens CSRF, SameSite cookies |
| SQL Injection | ORM TypeORM, requêtes paramétrées |
| Brute Force | Rate limiting, lockout de compte |
| Man-in-the-Middle | TLS 1.3, HSTS |
| Session Hijacking | JWT, refresh tokens, IP checking optionnel |
| Directory Traversal | Validation des chemins de fichiers |

## 22.5 Headers de Sécurité

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
```

## 22.6 Journalisation (Audit)

- Actions journalisées : connexion, création/modification/suppression d'entités, paiements, modifications de permissions
- Informations enregistrées : utilisateur, action, type d'entité, ID, ancienne valeur, nouvelle valeur, IP, user-agent, timestamp
- Conservation : 3 ans minimum
- Consultation : accessible uniquement aux administrateurs

---

# 23. Justification de la Stack Technologique

## 23.1 Frontend : React + Next.js + TypeScript

**Pourquoi React ?**
- Large écosystème et communauté
- Composants réutilisables et maintenables
- Performance avec le Virtual DOM
- Riche bibliothèque de composants tiers
- Grande disponibilité de développeurs

**Pourquoi Next.js ?**
- SSR/SSG pour les pages publiques (SEO, temps de chargement)
- App Router moderne avec layouts imbriqués
- Server Components pour réduire le JavaScript côté client
- API Routes pour le développement backend intégré (si nécessaire)
- Image optimization intégrée

**Pourquoi TypeScript ?**
- Détection des erreurs à la compilation
- Auto-complétion et documentation intégrée dans l'IDE
- Contrats d'interface clairs entre frontend et backend
- Réduction des bugs en production

## 23.2 Backend : Node.js + NestJS + TypeScript

**Pourquoi Node.js ?**
- JavaScript unifié (frontend et backend) : réutilisation de code, partage de types
- Haute performance pour les applications I/O intensives
- Grande bibliothèque de packages (npm)
- Excellente gestion des connexions concurrentes

**Pourquoi NestJS ?**
- Architecture structurée similaire à Angular (controllers, services, modules)
- Injection de dépendances intégrée
- Support natif de TypeScript, validation, guards, interceptors
- Grande extensibilité et testabilité
- Documentation OpenAPI automatique

## 23.3 Base de Données : PostgreSQL

**Pourquoi PostgreSQL ?**
- Maturité, fiabilité, conformité ACID
- Types avancés (JSONB, arrays, range types) utiles pour les plannings
- Indexation avancée (GIN, GiST) pour la recherche de texte et les plages
- Réplication native
- Extensions puissantes (pg_cron pour tâches planifiées, pgcrypto)
- Performance excellente en lecture/écriture concurrente

## 23.4 Cache : Redis

- Cache des sessions et tokens
- Cache des données fréquemment accédées (listes de cours, profils)
- Files d'attente Bull pour les tâches asynchrones
- Stockage des sessions de chat en temps réel

---

# 24. Directives UX/UI

## 24.1 Principes Généraux

- **Design System** : Material Design 3 (Material You)
- **Responsive** : Mobile-first, breakpoints : 640px, 768px, 1024px, 1280px, 1536px
- **Accessibilité** : Conformité WCAG 2.1 niveau AA
  - Contraste minimum 4.5:1 pour le texte
  - Navigation au clavier complète
  - Labels ARIA sur tous les éléments interactifs
  - Messages d'erreur explicites
- **Langue** : Français intégral (l'interface, les messages d'erreur, les notifications)
- **Direction** : LTR (Left-to-Right)

## 24.2 Palette de Couleurs

| Rôle | Couleur | Hex | Utilisation |
|------|---------|-----|-------------|
| Primaire | Bleu professionnel | #2563EB | Actions principales, liens, header |
| Secondaire | Vert succès | #059669 | Validations, présences, paiements OK |
| Avertissement | Orange | #D97706 | Alertes, avertissements |
| Erreur | Rouge | #DC2626 | Erreurs, impayés, blocages |
| Neutre | Gris | #6B7280 | Texte secondaire, bordures |
| Fond | Blanc/Clair | #F9FAFB | Arrière-plan principal |

## 24.3 Typographie

- **Police principale** : Inter (sans-serif, lisible à l'écran)
- **Police titres** : Inter Bold
- **Hiérarchie** : h1 (32px), h2 (24px), h3 (20px), h4 (16px), body (14px), small (12px)

## 24.4 Composants Clés

- **Navigation** : Sidebar responsive (rétractable sur mobile) + Topbar avec notifications
- **Tableaux** : Datatables avec tri, filtre, recherche, pagination
- **Formulaires** : Étapes (wizard), validation en temps réel, messages d'erreur inline
- **Calendrier** : Vue mensuelle/hebdomadaire/quotidienne, drag-and-drop pour modification
- **Graphiques** : Courbes, barres, camemberts, cartes KPI
- **Chat** : Interface de messagerie type WhatsApp, bulles, indicateur de saisie
- **Dashboard** : Widgets redimensionnables, configuration par rôle

## 24.5 États et Feedback

Chaque composant doit gérer les états suivants :
- **Loading** : Skeleton screens ou spinners
- **Empty** : Message + illustration + CTA
- **Error** : Message d'erreur + bouton réessayer
- **Success** : Toast de confirmation
- **Edge cases** : Données tronquées, longues listes, valeurs nulles

---

# 25. Descriptions des Maquettes et Wireframes

## 25.1 Écran de Connexion

- Logo du centre centré en haut
- Champ email avec icône
- Champ mot de passe avec toggle visibilité
- Lien « Mot de passe oublié ? »
- Bouton « Se connecter » (pleine largeur)
- Lien « Créer un compte » en bas
- Messages d'erreur sous les champs concernés
- Version responsive : centré verticalement et horizontalement

## 25.2 Dashboard Administrateur

**Zone supérieure (4 cartes KPI) :**
- Revenu du mois (avec variation en % vs mois précédent)
- Élèves actifs
- Taux d'occupation moyen
- Nouveaux inscrits (mois en cours)

**Zone centrale gauche :**
- Graphique d'évolution des revenus (courbe, 12 mois)
- Graphique de répartition des présences (camembert)

**Zone centrale droite :**
- Liste des dernières inscriptions
- Alertes et notifications récentes

**Zone inférieure :**
- Tableau des meilleurs enseignants (leaderboard)
- Cours populaires

## 25.3 Inscription Élève (Wizard)

**Étape 1 :** Type d'inscription (cartes de sélection : Régulier / Session unique)
**Étape 2 :** Informations personnelles (nom, prénom, date naissance, email, téléphone, adresse, wilaya, commune)
**Étape 3 :** Informations parents (nom, prénom, email, téléphone, lien parenté × 2)
**Étape 4 :** Niveau et matières (sélection niveau → affichage matières disponibles → sélection)
**Étape 5 :** Choix cours (filtres par type, jour, horaire → sélection groupe)
**Étape 6 :** Récapitulatif et confirmation
**Étape 7 :** Paiement (le cas échéant)

Barre de progression en haut, boutons « Précédent » et « Suivant »

## 25.4 Calendrier Hebdomadaire

- Vue semaine (lundi → samedi) avec créneaux horaires (8h → 20h)
- Chaque cours affiché comme un bloc coloré
- Infobulle au survol : matière, enseignant, salle, nombre d'élèves
- Clic sur un bloc : détails du cours
- Filtres par type de cours, enseignant, salle
- Légende des couleurs par matière

## 25.5 Interface de Scan RFID

- Écran plein écran (poste dédié à l'entrée)
- Affichage en temps réel du dernier scan
- Photo de l'élève, nom, prénom, cours du jour
- Statut : ✓ Accepté / ✗ Refusé avec motif
- Liste des dernières entrées du jour (scrollable)
- Mode manuel : champ de recherche d'élève + bouton « Marquer présence »

## 25.6 Messagerie Interne

- Panneau latéral gauche : liste des conversations
- Panneau principal : fil de messages
- Champ de saisie en bas avec attachement possible
- Indicateur de lecture (✓✓)
- Recherche de conversations
- Badge de notifications non lues

---

# 26. Structure de Navigation

## 26.1 Arborescence Administrateur

```
Dashboard
├── Vue d'ensemble
├── Revenus
└── Statistiques

Gestion
├── Utilisateurs
│   ├── Élèves
│   ├── Enseignants
│   ├── Assistants
│   └── Parents
├── Cours
│   ├── Liste
│   ├── Créer
│   └── Planification
├── Salles
├── Niveaux et Matières
└── Campagnes d'inscription

Finances
├── Paiements
├── Factures
└── Rapports financiers

Présences
├── Vue temps réel
├── Historique
└── Cartes RFID

Communication
├── Messagerie
└── Notifications

Évaluations
├── Leaderboard
└── Détails par enseignant

Système
├── Paramètres
├── Journaux d'audit
├── Sauvegardes
└── Permissions
```

## 26.2 Arborescence Assistant

```
Dashboard
├── Présences du jour
├── Inscriptions en attente
└── Alertes

Inscriptions
├── Nouvelle inscription
├── Liste d'attente
└── Campagnes actives

Cours
├── Planning
└── Groupes

Finances
├── Encaissements
├── Factures
└── Historique

Élèves
├── Profils
├── Cartes RFID
└── Présences

Communication
├── Messagerie
└── Notifications
```

## 26.3 Arborescence Enseignant

```
Dashboard
├── Mes cours du jour
├── Revenu estimé
└── Mes évaluations

Mes Cours
├── Planning
├── Mes groupes
└── Présences de mes élèves

Ressources
├── Gérer mes ressources
└── Ajouter une ressource

Finances
├── Revenus
└── Historique des paiements

Communication
├── Messagerie
└── Notifications
```

## 26.4 Arborescence Élève

```
Dashboard
├── Mes prochains cours
├── Mes présences
└── Notifications

Mes Cours
├── Emploi du temps
├── Cours disponibles
└── Historique

Ressources
├── Mes ressources
└── Téléchargements

Finances
├── Mes factures
└── Mes paiements

Évaluations
├── Évaluer un enseignant
└── Classement des enseignants

Profil
├── Informations personnelles
├── Informations parents
└── Paramètres

Communication
├── Messagerie
└── Notifications
```

## 26.5 Arborescence Parent

```
Dashboard
├── Présences de mes enfants
├── Factures en attente
└── Notifications

Mes Enfants
├── Présences
├── Cours suivis
└── Notes/Évaluations

Finances
├── Factures
├── Paiements
└── Historique

Communication
├── Messagerie (Assistant)
└── Notifications

Approbations
├── Cours particuliers à valider
└── Historique des approbations
```

---

# 27. Analyse des Risques

## 27.1 Matrice des Risques

| ID | Risque | Probabilité | Impact | Niveau | Mesure d'Atténuation |
|----|--------|-------------|--------|--------|---------------------|
| R-01 | Dépassement du budget | Moyenne | Élevé | Élevé | Suivi budgétaire hebdomadaire, marge 15% |
| R-02 | Retard de livraison | Élevée | Élevé | Critique | Planning réaliste avec marges, sprints courts |
| R-03 | Glissement du périmètre | Élevée | Élevé | Critique | Processus strict de gestion des changements |
| R-04 | Panne matérielle RFID | Faible | Élevé | Moyen | Mode manuel de secours, lecteurs de rechange |
| R-05 | Fuite de données sensibles | Faible | Critique | Élevé | Chiffrement, audits, conformité RGPD |
| R-06 | Indisponibilité du système | Faible | Critique | Élevé | Architecture redondante, backups, monitoring |
| R-07 | Résistance au changement | Moyenne | Moyen | Moyen | Formation, accompagnement, communication |
| R-08 | Conflits de planning complexes | Moyenne | Moyen | Moyen | Algorithme robuste, tests extensifs |
| R-09 | Perte de données | Faible | Critique | Élevé | Backups quotidiens, RPO ≤ 15 min |
| R-10 | Problèmes de performance | Moyenne | Élevé | Élevé | Tests de charge, optimisation, scaling |
| R-11| Départ d'un membre clé | Faible | Élevé | Moyen | Documentation, code review, backup des rôles |
| R-12 | Non-conformité légale | Faible | Critique | Élevé | Veille juridique, audit RGPD externe |

## 27.2 Plan de Gestion des Risques

1. **Identification** : Revue des risques en COPIL mensuel
2. **Évaluation** : Réévaluation de la probabilité et de l'impact tous les mois
3. **Atténuation** : Mise en oeuvre des mesures d'atténuation
4. **Suivi** : Tableau de bord des risques dans l'outil de gestion de projet
5. **Contingence** : Budget et délais de contingence (15%)

---

# 28. Contraintes du Projet

## 28.1 Contraintes Techniques

| ID | Contrainte | Description |
|----|------------|-------------|
| CT-01 | Compatibilité navigateurs | Support Chrome, Firefox, Safari, Edge (2 dernières versions majeures) |
| CT-02 | Responsive design | L'application doit être utilisable sur mobile, tablette et desktop |
| CT-03 | Déploiement | Docker obligatoire pour le backend |
| CT-04 | Base de données | PostgreSQL 16 requis |
| CT-05 | API REST | Respect des standards REST, documentation OpenAPI |
| CT-06 | Sécurité | HTTPS, JWT, RBAC, OWASP Top 10 |
| CT-07 | Code source | Git, GitHub/GitLab, convention de nommage |

## 28.2 Contraintes Fonctionnelles

| ID | Contrainte | Description |
|----|------------|-------------|
| CF-01 | Langue | Interface 100% en français |
| CF-02 | Devise | Dinar Algérien (DZD) |
| CF-03 | Calendrier | Semaine algérienne (samedi → jeudi) |
| CF-04 | Wilayas | Découpage administratif algérien (58 wilayas) |
| CF-05 | Réglementation | Conformité loi 18-07 protection des données |

## 28.3 Contraintes de Gestion de Projet

| ID | Contrainte | Description |
|----|------------|-------------|
| CG-01 | Méthodologie | Agile Scrum, sprints de 2 semaines |
| CG-02 | Livraisons | Incrémentation progressive par module |
| CG-03 | Documentation | Complète : technique, utilisateur, déploiement |
| CG-04 | Recette | Validation par le client à chaque sprint |
| CG-05 | Formation | Formation des utilisateurs (3 jours minimum) |

---

# 29. Critères d'Acceptation

## 29.1 Critères Généraux

| ID | Critère | Description |
|----|---------|-------------|
| CA-01 | Fonctionnalités | 100% des exigences fonctionnelles critiques implémentées |
| CA-02 | Performance | Temps de réponse respectant les cibles définies en section 9 |
| CA-03 | Sécurité | Audit de sécurité passé (tests d'intrusion) |
| CA-04 | Disponibilité | Uptime ≥ 99,5% sur période de test de 30 jours |
| CA-05 | Compatibilité | Fonctionne sur Chrome, Firefox, Safari, Edge |
| CA-06 | Responsive | Utilisable sur mobile (320px+), tablette, desktop |
| CA-07 | Sauvegardes | Backups automatiques fonctionnels et testés |
| CA-08 | Tests | Couverture de tests ≥ 80%, tests d'intégration passés |

## 29.2 Critères par Module

| Module | Critères d'Acceptation |
|--------|----------------------|
| Authentification | Inscription, connexion, vérification email, réinitialisation, RBAC fonctionnels |
| Inscriptions | Parcours complet fonctionnel, gestion des campagnes, liste d'attente |
| Cours | CRUD cours, planification sans conflit, gestion des types |
| RFID | Scan fonctionnel avec alertes, mode manuel de secours |
| Finances | Paiements, factures PDF, reçus, historique, relances automatiques |
| Ressources | Upload, téléchargement, organisation par cours |
| Communication | Messagerie interne, notifications email et système |
| Évaluations | Notation, calcul moyenne, leaderboard |
| Dashboard | KPI corrects, graphiques, données temps réel |
| Rapports | Génération PDF et Excel, filtres de période |

## 29.3 Procédure de Recette

1. Tests unitaires automatisés (CI)
2. Tests d'intégration automatisés (CI)
3. Tests de charge (avant mise en production)
4. Tests d'acceptance utilisateur (UAT) avec le client
5. Validation en COPIL
6. Signature du procès-verbal de recette

---

# 30. Stratégie de Test

## 30.1 Niveaux de Test

### Tests Unitaires
- **Outil :** Jest (backend), Vitest (frontend)
- **Couverture cible :** ≥ 80%
- **Cible :** Services, utilitaires, validations, guards
- **Exécution :** À chaque commit (CI)

### Tests d'Intégration
- **Outil :** Jest + Supertest (back-end), Testing Library (frontend)
- **Cible :** API endpoints, flux critiques (inscription, paiement, scan RFID)
- **Exécution :** À chaque push sur branche de développement

### Tests de Charge
- **Outil :** k6 ou Artillery
- **Scénarios :** 500 utilisateurs simultanés, pics de connexion
- **Métriques :** Temps de réponse, taux d'erreur, utilisation CPU/mémoire
- **Exécution :** Avant chaque release majeure

### Tests de Sécurité
- **Outil :** OWASP ZAP, Snyk
- **Cible :** OWASP Top 10, injection SQL, XSS, CSRF
- **Exécution :** Trimestriel et avant mise en production

### Tests d'Acceptance (UAT)
- **Acteurs :** Utilisateurs réels (assistants, enseignants, admin)
- **Durée :** 2 semaines
- **Validation :** Scénarios métier complets

## 30.2 Plan de Test

```
Phase 1 : Tests unitaires (semaine 1-2 de chaque sprint)
Phase 2 : Tests d'intégration (fin de sprint)
Phase 3 : Tests de non-régression (avant release)
Phase 4 : Tests de charge (avant mise en production)
Phase 5 : Tests UAT (2 semaines)
Phase 6 : Tests de sécurité (trimestriel)
```

## 30.3 Environnements de Test

| Environnement | Usage | Données | Accès |
|---------------|-------|---------|-------|
| Développement | Développement quotidien | Factices | Équipe dev |
| Intégration | CI/CD, tests automatisés | Factices | CI |
| Recette | Tests fonctionnels, UAT | Anonymisées | Client, QA |
| Pré-production | Tests de charge, validation finale | Anonymisées | Équipe projet |
| Production | Exploitation réelle | Réelles | Utilisateurs |

---

# 31. Stratégie de Déploiement

## 31.1 Infrastructure Cible

```
[Cloud Provider]
├── Load Balancer (HAProxy / Nginx)
├── Frontend (Next.js)
│   └── 2+ instances, auto-scaling
├── Backend (NestJS)
│   └── 2+ instances, auto-scaling
├── Base de données PostgreSQL
│   ├── Primary (lecture/écriture)
│   └── Standby (lecture seule, failover)
├── Redis Cluster
├── File Storage (Object Storage S3)
└── Monitoring (Prometheus + Grafana)
```

## 31.2 Pipeline CI/CD

```
1. Développeur push → GitHub/GitLab
2. CI Pipeline :
   a. Lint (ESLint)
   b. Tests unitaires
   c. Build
   d. Tests d'intégration
3. Déploiement automatique → Environnement de recette
4. Tests de non-régression
5. Validation manuelle
6. Déploiement → Pré-production
7. Tests de charge
8. Déploiement → Production (blue/green deployment)
```

## 31.3 Stratégie de Dé cons

- **Blue/Green Deployment** : Deux environnements de production identiques
- **Rollback** : Capacité de revenir à la version précédente en moins de 5 minutes
- **Zero Downtime** : Pas d'interruption de service pendant les déploiements
- **Health Checks** : Vérification de l'état des instances après déploiement

---

# 32. Stratégie de Maintenance

## 32.1 Maintenance Corrective

- **SLA :** 
  - Incident critique : réponse ≤ 2 heures, résolution ≤ 8 heures
  - Incident majeur : réponse ≤ 4 heures, résolution ≤ 24 heures
  - Incident mineur : réponse ≤ 8 heures, résolution ≤ 72 heures
- **Processus :** Ticket → Diagnostic → Correction → Test → Déploiement

## 32.2 Maintenance Évolutive

- **Fréquence :** Releases mensuelles
- **Processus :** Expression de besoin → Spécification → Développement → Test → Déploiement
- **Priorisation :** Par le comité de pilotage

## 32.3 Maintenance Préventive

- **Monitoring** : Prometheus + Grafana (CPU, mémoire, disque, requêtes/s, temps de réponse)
- **Alerting** : Alertes automatiques par email/SMS en cas d'anomalie
- **Logs** : Centralisés (ELK Stack ou equivalent)
- **Backups** : Vérification hebdomadaire de la restauration
- **Mises à jour** : Sécurité (patchs critiques sous 48h), versions mineures (mensuel)

## 32.4 Procédures d'Urgence

- **Plan de reprise d'activité (PRA) :** Basculement vers le serveur standby en moins de 4 heures
- **Plan de continuité d'activité (PCA) :** Mode dégradé avec fonctionnalités essentielles
- **Contact :** Équipe DevOps disponible 24/7 pour les incidents critiques

---

# 33. Améliorations Futures

## 33.1 Version 2 (Moyen Terme — 6 à 12 mois après V1)

| Amélioration | Description | Priorité |
|-------------|-------------|----------|
| Application mobile native | iOS et Android (React Native ou Flutter) | Haute |
| Paiement en ligne intégré | Intégration CIB/Edahabia/SATIM | Haute |
| Emploi du temps intelligent | Algorithme de recommandation de créneaux | Moyenne |
| Visioconférence intégrée | Intégration Zoom/Teams/Jitsi | Moyenne |
| Interface en arabe | Support multilingue (FR/AR) | Haute |
| Notifications SMS | Via API SMS locale | Moyenne |
| Signature électronique | Pour contrats et autorisations | Basse |

## 33.2 Version 3 (Long Terme — 12 à 24 mois après V1)

| Amélioration | Description |
|-------------|-------------|
| Module CRM | Gestion de la relation client, campagnes marketing |
| Module Ressources Humaines | Gestion des contrats enseignants, absences, congés |
| Comptabilité intégrée | Liasse fiscale, déclarations CNAS/CASNOS |
| Portail élèves et parents | Application mobile dédiée |
| Intelligence Artificielle | Prédiction des risques d'abandon, recommandation de cours |
| Multi-centres | Gestion de plusieurs établissements depuis une plateforme unique |
| Chatbot | Assistant virtuel pour les questions fréquentes |
| E-learning | Cours en ligne asynchrones, quiz, suivi de progression |

---

# 34. Conclusion

Le présent Cahier des Charges Fonctionnel et Technique détaille l'ensemble des spécifications nécessaires à la conception, au développement et au déploiement d'une plateforme ERP web complète pour la gestion d'un centre de soutien scolaire privé.

Ce document couvre l'intégralité du périmètre fonctionnel (10 modules métier couvrant l'authentification, les inscriptions, la planification des cours, les présences RFID, la gestion financière, les ressources pédagogiques, la communication, les évaluations, les tableaux de bord et l'administration système) ainsi que le périmètre technique (architecture frontend React/Next.js, backend NestJS, base de données PostgreSQL, sécurité JWT/RBAC, infrastructure Docker/cloud).

Le projet représente un investissement stratégique majeur pour le centre de soutien scolaire, lui permettant de :
1. Centraliser et sécuriser l'ensemble de ses données ;
2. Automatiser ses processus métier chronophages ;
3. Offrir une expérience transparente et moderne à ses élèves et parents ;
4. Piloter son activité avec des indicateurs fiables en temps réel ;
5. Se préparer à une croissance future maîtrisée.

L'estimation préliminaire de la durée du projet est de 8 à 12 mois, avec une approche Agile par sprints de 2 semaines, permettant des livraisons incrémentales et une validation continue par le client.

La réussite de ce projet repose sur :
- L'engagement de toutes les parties prenantes ;
- Le respect du périmètre défini ;
- La qualité de la communication entre l'équipe projet et le client ;
- L'application rigoureuse des processus de test et de validation.

Nous recommandons au client de valider le présent document et de procéder à la phase de planification détaillée pour le lancement effectif du développement.

---

**Approuvé par :**

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Direction du centre | | | |
| Chef de projet MOA | | | |
| Chef de projet MOE | | | |

---

*Fin du document — Cahier des Charges Fonctionnel et Technique — Version 1.0 — Juin 2026*
