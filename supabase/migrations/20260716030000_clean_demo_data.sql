-- Wipe all demo transactional data so the app can start fresh with real data
DELETE FROM attendance_records;
DELETE FROM attendance_sessions;
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM payments;
DELETE FROM transactions;
DELETE FROM course_schedules;
DELETE FROM course_enrollments;
DELETE FROM waiting_list;
DELETE FROM private_lessons;
DELETE FROM private_lesson_inquiries;
DELETE FROM notifications;
DELETE FROM messages;
UPDATE courses SET current_enrollments = 0;
