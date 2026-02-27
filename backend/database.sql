CREATE DATABASE IF NOT EXISTS acadportal;

USE acadportal;

CREATE TABLE IF NOT EXISTS faculty (
    faculty_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS students (
    enrollment_no VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    semester INT,
    section VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    deadline DATE,
    branch VARCHAR(10),
    semester INT,
    year VARCHAR(20),
    assignment_file VARCHAR(255),
    created_at DATETIME,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
);

CREATE TABLE IF NOT EXISTS submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    enrollment_no VARCHAR(20),
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(255),
    grade INT,
    similarity_score FLOAT,
    status VARCHAR(50) DEFAULT 'Pending',
    evaluated_at DATETIME,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id),
    FOREIGN KEY (enrollment_no) REFERENCES students(enrollment_no)
);

CREATE TABLE IF NOT EXISTS marks (
    marks_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_no VARCHAR(20),
    subject VARCHAR(100),
    mid_term_1 INT,
    mid_term_2 INT,
    FOREIGN KEY (enrollment_no) REFERENCES students(enrollment_no)
);

-- Insert dummy data for testing
INSERT INTO faculty (faculty_id, name, password, department) VALUES
('FAC001', 'Rishi Tripathi', 'password123', 'CSE');

INSERT INTO students (enrollment_no, name, password, department, semester, section) VALUES
('STU001', 'Aman', 'password123', 'CSE', 3, 'A'),
('STU002', 'Riya', 'password123', 'CSE', 3, 'A');