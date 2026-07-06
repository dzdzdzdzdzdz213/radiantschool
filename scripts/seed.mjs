import { Client } from 'pg';

const password = encodeURIComponent('3Ks#?Y.tZQ2#Dr5');
const client = new Client({
  connectionString: `postgresql://postgres.kaoxcbqhuwhtadpgccjp:${password}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

// Levels
await client.query(`INSERT INTO levels (name, category, stream, year, sort_order) VALUES
('1AP', 'primary', NULL, 1, 1),
('2AP', 'primary', NULL, 2, 2),
('3AP', 'primary', NULL, 3, 3),
('4AP', 'primary', NULL, 4, 4),
('5AP', 'primary', NULL, 5, 5),
('1AM', 'middle', NULL, 1, 6),
('2AM', 'middle', NULL, 2, 7),
('3AM', 'middle', NULL, 3, 8),
('4AM', 'middle', NULL, 4, 9),
('1AS', 'high_school', 'Scientifique', 1, 10),
('1AS', 'high_school', 'Lettres', 1, 11),
('2AS', 'high_school', 'Scientifique', 2, 12),
('2AS', 'high_school', 'Mathématiques', 2, 13),
('2AS', 'high_school', 'Maths Techniques', 2, 14),
('2AS', 'high_school', 'Génie Mécanique', 2, 15),
('2AS', 'high_school', 'Génie Électrique', 2, 16),
('2AS', 'high_school', 'Génie des Procédés', 2, 17),
('2AS', 'high_school', 'Lettres', 2, 18),
('2AS', 'high_school', 'Gestion et Économie', 2, 19),
('3AS', 'high_school', 'Scientifique', 3, 20),
('3AS', 'high_school', 'Mathématiques', 3, 21),
('3AS', 'high_school', 'Lettres', 3, 22),
('3AS', 'high_school', 'Gestion et Économie', 3, 23),
('3AS', 'high_school', 'Baccalauréat', 3, 24) ON CONFLICT DO NOTHING`);
console.log('Levels done');

// Subjects — complete Algerian system
await client.query(`INSERT INTO subjects (name, description) VALUES
('Mathématiques', 'Cours de mathématiques'),
('Physique', 'Cours de physique et chimie'),
('Sciences', 'Cours de sciences de la nature et de la vie'),
('Français', 'Cours de français'),
('Arabe', "Cours d'arabe"),
('Anglais', "Cours d'anglais"),
('Histoire', "Cours d'histoire"),
('Géographie', 'Cours de géographie'),
('Philosophie', 'Cours de philosophie'),
('Sciences Islamiques', 'Cours de sciences islamiques'),
('Éducation Civique', 'Éducation civique et morale'),
('Éducation Artistique', 'Dessin et éducation artistique'),
('Éducation Musicale', 'Musique et chant'),
('Éducation Physique et Sportive', 'EPS'),
('Technologie', 'Technologie et travaux pratiques'),
('Informatique', 'Informatique et programmation'),
('Génie Mécanique', 'Génie mécanique'),
('Génie Électrique', 'Génie électrique'),
('Génie des Procédés', 'Génie des procédés'),
('Génie Civil', 'Génie civil'),
('Économie et Gestion', 'Économie et gestion'),
('Tamazight', 'Langue amazighe'),
('Allemand', 'Langue allemande'),
('Espagnol', 'Langue espagnole'),
('Italien', 'Langue italienne') ON CONFLICT (name) DO NOTHING`);
console.log('Subjects done');

// Level-Subject associations — complete Algerian system
// Primary
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.category = 'primary'
AND s.name IN ('Mathématiques', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Sciences Islamiques', 'Éducation Civique', 'Éducation Artistique', 'Éducation Musicale', 'Éducation Physique et Sportive', 'Tamazight')
ON CONFLICT DO NOTHING`);
console.log('LS primary done');

// Middle
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.category = 'middle'
AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Sciences Islamiques', 'Éducation Civique', 'Éducation Physique et Sportive', 'Technologie', 'Informatique', 'Tamazight', 'Allemand', 'Espagnol', 'Italien')
ON CONFLICT DO NOTHING`);
console.log('LS middle done');

// 1AS Scientifique
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '1AS' AND l.stream = 'Scientifique'
AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive', 'Tamazight', 'Allemand', 'Espagnol')
ON CONFLICT DO NOTHING`);

// 1AS Lettres
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '1AS' AND l.stream = 'Lettres'
AND s.name IN ('Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive', 'Tamazight', 'Allemand', 'Espagnol')
ON CONFLICT DO NOTHING`);

// 2AS Scientifique & Mathématiques (same core)
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '2AS' AND l.stream IN ('Scientifique', 'Mathématiques')
AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive', 'Informatique')
ON CONFLICT DO NOTHING`);

// 2AS Maths Techniques
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '2AS' AND l.stream = 'Maths Techniques'
AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive', 'Technologie')
ON CONFLICT DO NOTHING`);

// 2AS Génie Mécanique
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '2AS' AND l.stream = 'Génie Mécanique'
AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Génie Mécanique', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive')
ON CONFLICT DO NOTHING`);

// 2AS Génie Électrique
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '2AS' AND l.stream = 'Génie Électrique'
AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Génie Électrique', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive')
ON CONFLICT DO NOTHING`);

// 2AS Génie des Procédés
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '2AS' AND l.stream = 'Génie des Procédés'
AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Génie des Procédés', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive')
ON CONFLICT DO NOTHING`);

// 2AS Lettres
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '2AS' AND l.stream = 'Lettres'
AND s.name IN ('Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive')
ON CONFLICT DO NOTHING`);

// 2AS Gestion et Économie
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '2AS' AND l.stream = 'Gestion et Économie'
AND s.name IN ('Mathématiques', 'Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive', 'Informatique', 'Économie et Gestion')
ON CONFLICT DO NOTHING`);

// 3AS Scientifique & Mathématiques (same core)
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '3AS' AND l.stream IN ('Scientifique', 'Mathématiques')
AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive')
ON CONFLICT DO NOTHING`);

// 3AS Lettres
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '3AS' AND l.stream = 'Lettres'
AND s.name IN ('Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive')
ON CONFLICT DO NOTHING`);

// 3AS Gestion et Économie
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '3AS' AND l.stream = 'Gestion et Économie'
AND s.name IN ('Mathématiques', 'Français', 'Arabe', 'Anglais', 'Histoire', 'Géographie', 'Philosophie', 'Sciences Islamiques', 'Éducation Physique et Sportive', 'Informatique', 'Économie et Gestion')
ON CONFLICT DO NOTHING`);

// 3AS Baccalauréat (legacy catch-all — all subjects)
await client.query(`INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '3AS' AND l.stream = 'Baccalauréat'
ON CONFLICT DO NOTHING`);
console.log('LS high school done');

// Rooms
await client.query(`INSERT INTO rooms (name, capacity, floor, equipment) VALUES
('Salle 1', 30, 1, '["tableau", "vidéoprojecteur", "climatisation"]'),
('Salle 2', 25, 1, '["tableau", "climatisation"]'),
('Salle 3', 20, 2, '["tableau", "vidéoprojecteur"]'),
('Salle VIP', 6, 2, '["tableau", "vidéoprojecteur", "climatisation", "wifi"]'),
('Salle Particuliers', 2, 1, '["tableau", "climatisation"]') ON CONFLICT DO NOTHING`);
console.log('Rooms done');

console.log('Seed complete!');
await client.end();
