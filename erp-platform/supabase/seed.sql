-- Seed data for development
-- Run after migration: psql -f seed.sql

-- Levels
INSERT INTO levels (name, category, stream, year, sort_order) VALUES
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
('2AS', 'high_school', 'Mathématiques', 2, 12),
('2AS', 'high_school', 'Maths Techniques', 2, 13),
('2AS', 'high_school', 'Génie Mécanique', 2, 14),
('2AS', 'high_school', 'Génie Électrique', 2, 15),
('2AS', 'high_school', 'Génie des Procédés', 2, 16),
('3AS', 'high_school', 'Baccalauréat', 3, 17);

-- Subjects
INSERT INTO subjects (name, description) VALUES
('Mathématiques', 'Cours de mathématiques'),
('Physique', 'Cours de physique'),
('Sciences', 'Cours de sciences'),
('Français', 'Cours de français'),
('Arabe', 'Cours d''arabe'),
('Anglais', 'Cours d''anglais'),
('Histoire', "Cours d'histoire"),
('Géographie', 'Cours de géographie'),
('Philosophie', 'Cours de philosophie'),
('Sciences Islamiques', "Cours de sciences islamiques");

-- Level-Subject associations
INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.category IN ('primary', 'middle')
AND s.name IN ('Mathématiques', 'Français', 'Arabe', 'Anglais', 'Sciences');

INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.stream = 'Scientifique' AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais');

INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.stream = 'Lettres' AND s.name IN ('Français', 'Arabe', 'Anglais', 'Philosophie', 'Histoire', 'Géographie');

INSERT INTO level_subject (level_id, subject_id)
SELECT l.id, s.id FROM levels l, subjects s
WHERE l.name = '3AS' AND s.name IN ('Mathématiques', 'Physique', 'Sciences', 'Français', 'Arabe', 'Anglais', 'Philosophie', 'Histoire', 'Géographie', 'Sciences Islamiques');

-- Rooms
INSERT INTO rooms (name, capacity, floor, equipment) VALUES
('Salle 1', 30, 1, '["tableau", "vidéoprojecteur", "climatisation"]'),
('Salle 2', 25, 1, '["tableau", "climatisation"]'),
('Salle 3', 20, 2, '["tableau", "vidéoprojecteur"]'),
('Salle VIP', 6, 2, '["tableau", "vidéoprojecteur", "climatisation", "wifi"]'),
('Salle Particuliers', 2, 1, '["tableau", "climatisation"]');
