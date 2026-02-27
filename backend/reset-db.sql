-- Reset AcadPortal Database to correct schema
-- This matches the seed.sql and controller expectations

DROP DATABASE IF EXISTS acadportal_db;
CREATE DATABASE acadportal_db;
USE acadportal_db;

-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
    faculty_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    enrollment_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    semester INT,
    section VARCHAR(10)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    deadline DATE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    enrollment_no VARCHAR(20),
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255),
    grade INT,
    similarity_score FLOAT,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
    FOREIGN KEY (enrollment_no) REFERENCES students(enrollment_no)
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
    marks_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_no VARCHAR(20),
    subject VARCHAR(100),
    mid_term_1 INT,
    mid_term_2 INT,
    FOREIGN KEY (enrollment_no) REFERENCES students(enrollment_no)
);

-- ===== SEED DATA =====

-- Insert faculty members
INSERT INTO faculty (faculty_id, name, password, department) VALUES
('FAC001', 'Dr. Rishi Tripathi', 'password', 'CSE'),
('FAC002', 'Prof. Sharma', 'password', 'CSE'),
('FAC003', 'Dr. Verma', 'password', 'CSE');

-- Insert students
INSERT INTO students (enrollment_no, name, password, department, semester, section) VALUES
('STU001', 'Aman Kumar', 'password', 'CSE', 3, 'A'),
('STU002', 'Riya Singh', 'password', 'CSE', 3, 'A'),
('STU003', 'Rahul Patel', 'password', 'CSE', 3, 'B'),
('2023CSE001', 'Alice Johnson', 'password', 'CSE', 3, 'A'),
('2023CSE002', 'Bob Smith', 'password', 'CSE', 3, 'A'),
('2023CSE003', 'Carol Williams', 'password', 'CSE', 3, 'B'),
('2023CSE004', 'David Brown', 'password', 'CSE', 3, 'B');

-- Insert assignments
INSERT INTO assignments (faculty_id, title, subject, deadline) VALUES
('FAC001', 'Database Design Project', 'Database Systems', '2025-01-10'),
('FAC001', 'REST API Development', 'Web Technologies', '2025-01-15'),
('FAC002', 'Operating System Lab Report', 'Operating Systems', '2024-12-25'),
('FAC001', 'Data Structures Assignment', 'Data Structures', '2025-01-05'),
('FAC002', 'Web Design Mockup', 'Web Design', '2025-01-12'),
('FAC003', 'Algorithm Analysis', 'Algorithms', '2025-01-20');

-- Insert submissions
INSERT INTO submissions (assignment_id, enrollment_no, submission_date, file_path, grade, similarity_score) VALUES
(1, 'STU001', '2024-12-20 10:30:00', '/uploads/STU001_assignment1.pdf', 85, 8.5),
(2, 'STU001', '2024-12-22 14:15:00', '/uploads/STU001_assignment2.pdf', 92, 5.2),
(3, 'STU001', '2024-12-24 09:45:00', '/uploads/STU001_assignment3.pdf', 78, 12.1),
(1, 'STU002', '2024-12-21 11:20:00', '/uploads/STU002_assignment1.pdf', 90, 3.8),
(2, 'STU002', '2024-12-23 13:50:00', '/uploads/STU002_assignment2.pdf', 88, 7.9),
(1, '2023CSE001', '2024-12-19 15:30:00', '/uploads/2023CSE001_assignment1.pdf', 87, 6.3),
(2, '2023CSE001', '2024-12-21 10:00:00', '/uploads/2023CSE001_assignment2.pdf', 94, 4.1),
(1, '2023CSE002', '2024-12-20 12:45:00', '/uploads/2023CSE002_assignment1.pdf', 82, 9.2),
(2, '2023CSE002', '2024-12-22 16:20:00', '/uploads/2023CSE002_assignment2.pdf', 89, 6.7),
(3, '2023CSE002', '2024-12-24 08:30:00', '/uploads/2023CSE002_assignment3.pdf', 80, 11.4);

-- Insert marks
INSERT INTO marks (enrollment_no, subject, mid_term_1, mid_term_2) VALUES
('STU001', 'Database Systems', 42, 40),
('STU001', 'Web Technologies', 48, 44),
('STU001', 'Operating Systems', 39, 39),
('STU001', 'Data Structures', 45, 43),
('STU002', 'Database Systems', 48, 46),
('STU002', 'Web Technologies', 44, 46),
('STU002', 'Operating Systems', 41, 42),
('STU002', 'Data Structures', 47, 48),
('STU003', 'Database Systems', 40, 38),
('STU003', 'Web Technologies', 42, 40),
('2023CSE001', 'Database Systems', 46, 45),
('2023CSE001', 'Web Technologies', 49, 48),
('2023CSE001', 'Operating Systems', 47, 46),
('2023CSE001', 'Data Structures', 50, 49),
('2023CSE002', 'Database Systems', 44, 43),
('2023CSE002', 'Web Technologies', 47, 46),
('2023CSE002', 'Operating Systems', 45, 44),
('2023CSE002', 'Data Structures', 48, 47),
('2023CSE003', 'Database Systems', 41, 39),
('2023CSE003', 'Web Technologies', 43, 41),
('2023CSE004', 'Database Systems', 45, 44),
('2023CSE004', 'Web Technologies', 46, 45);
