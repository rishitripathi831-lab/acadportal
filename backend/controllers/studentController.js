const db = require('../config/db');

exports.getAssignments = (req, res) => {
  const enrollment = req.params.id;
  if (!enrollment) return res.status(400).json({ message: 'Student id is required' });

  // CRITICAL: Fetch student's branch and semester from DB (source of truth)
  const studentQuery = 'SELECT department, semester FROM students WHERE enrollment_no = ?';
  db.query(studentQuery, [enrollment], (err, studentRows) => {
    if (err) {
      console.error('Error fetching student:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!studentRows || studentRows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { department, semester } = studentRows[0];

    // Return assignments ONLY for this student's branch and semester (all statuses)
    // Include submission info and server-side deadline comparison
    const query = `
      SELECT a.assignment_id, a.title, a.subject, a.deadline,
             f.name as faculty_name,
             s.submission_id, s.submission_date, s.file_path, s.grade, s.similarity_score,
             s.status AS submission_status,
             IF(a.deadline < NOW(), 1, 0) AS deadline_over
      FROM assignments a
      LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
      LEFT JOIN submissions s
        ON a.assignment_id = s.assignment_id AND s.enrollment_no = ?
      WHERE a.branch = ? AND a.semester = ?
      ORDER BY a.deadline DESC
    `;

    // IMPORTANT: Bind params in correct order: enrollment_no, branch, semester
    const params = [enrollment, department, semester];

    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching assignments:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json(results || []);
    });
  });
};

// Get pending assignments for a student (not submitted, matching branch & semester)
exports.getStudentPendingAssignments = (req, res) => {
  const enrollment = req.params.enrollmentNo;
  if (!enrollment) return res.status(400).json({ message: 'Student enrollment number is required' });

  // Find student's department and semester
  const studentQuery = 'SELECT department, semester FROM students WHERE enrollment_no = ?';
  db.query(studentQuery, [enrollment], (err, studentRows) => {
    if (err) {
      console.error('Error fetching student:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!studentRows || studentRows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { department, semester } = studentRows[0];

    const query = `
      SELECT a.assignment_id, a.title, a.subject, a.deadline
      FROM assignments a
      LEFT JOIN submissions s
        ON a.assignment_id = s.assignment_id AND s.enrollment_no = ?
      WHERE a.branch = ?
        AND a.semester = ?
        AND s.submission_id IS NULL
      ORDER BY a.deadline ASC
    `;

    db.query(query, [enrollment, department, semester], (err, results) => {
      if (err) {
        console.error('Error fetching pending assignments:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.json(results);
    });
  });
};

exports.getMarks = (req, res) => {
  const enrollment = req.params.id;
  if (!enrollment) return res.status(400).json({ message: 'Student id is required' });

  const query = 'SELECT * FROM marks WHERE enrollment_no = ?';
  db.query(query, [enrollment], (err, results) => {
    if (err) {
      console.error('Error fetching marks:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Return raw results - frontend will handle the data structure
    res.json({ results: results });
  });
};

// NEW: Add a student (faculty manual entry)
exports.addStudent = (req, res) => {
  const { enrollment_no, name, department, semester, password } = req.body;

  if (!enrollment_no || !name || !department || !semester) {
    return res.status(400).json({ message: 'Missing required student fields' });
  }

  const pwd = password || 'password';

  const query = `INSERT INTO students (enrollment_no, name, password, department, semester) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [enrollment_no, name, pwd, department, semester], (err, result) => {
    if (err) {
      console.error('Error adding student:', err);
      return res.status(500).json({ message: 'Failed to add student', error: err.message });
    }
    res.json({ message: 'Student added', enrollment_no });
  });
};

// NEW: Get students by branch/semester
exports.getStudentsByClass = (req, res) => {
  const { branch, semester } = req.params;
  if (!branch || !semester) return res.status(400).json({ message: 'Branch and semester required' });

  console.log('getStudentsByClass called with branch=', branch, 'semester=', semester);
  const query = `SELECT enrollment_no, name, department, semester FROM students WHERE department = ? AND semester = ? ORDER BY enrollment_no`;
  db.query(query, [branch, semester], (err, results) => {
    if (err) {
      console.error('Error fetching students by class:', err && err.stack ? err.stack : err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    console.log('Fetched students count=', (results || []).length);
    res.json(results || []);
  });
};

// Get student performance relative to a faculty's assignments
exports.getStudentPerformance = (req, res) => {
  const { enrollment_no, faculty_id } = req.params;
  if (!enrollment_no || !faculty_id) return res.status(400).json({ message: 'enrollment_no and faculty_id required' });

  // 1) total assignments by faculty
  const totalQuery = 'SELECT COUNT(*) as total FROM assignments WHERE faculty_id = ?';
  // 2) submissions by this student for assignments by this faculty
  const submittedQuery = `SELECT COUNT(DISTINCT s.assignment_id) as submitted FROM submissions s JOIN assignments a ON s.assignment_id = a.assignment_id WHERE s.enrollment_no = ? AND a.faculty_id = ?`;
  // 3) marks for the student (all subjects)
  const marksQuery = 'SELECT subject, mid_term_1 as mid1, mid_term_2 as mid2 FROM marks WHERE enrollment_no = ?';

  db.query(totalQuery, [faculty_id], (err, totalRes) => {
    if (err) {
      console.error('Error fetching total assignments:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    const total = totalRes[0]?.total || 0;

    db.query(submittedQuery, [enrollment_no, faculty_id], (err2, subRes) => {
      if (err2) {
        console.error('Error fetching submitted count:', err2);
        return res.status(500).json({ message: 'Internal server error' });
      }
      const submitted = subRes[0]?.submitted || 0;

      db.query(marksQuery, [enrollment_no], (err3, marksRes) => {
        if (err3) {
          console.error('Error fetching marks for student:', err3);
          return res.status(500).json({ message: 'Internal server error' });
        }

        return res.json({ totalAssignments: total, submittedAssignments: submitted, marks: marksRes || [] });
      });
    });
  });
};

// Get student profile
exports.getProfile = (req, res) => {
  const enrollment_no = req.params.id;
  if (!enrollment_no) return res.status(400).json({ message: 'Student ID is required' });

  const query = 'SELECT enrollment_no, name, password, department, semester, email FROM students WHERE enrollment_no = ?';
  db.query(query, [enrollment_no], (err, results) => {
    if (err) {
      console.error('Error fetching student profile:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = results[0];
    // Don't return password to frontend
    delete student.password;
    res.json(student);
  });
};

// Update student email
exports.updateEmail = (req, res) => {
  const enrollment_no = req.params.id;
  const { email } = req.body;

  if (!enrollment_no || !email) {
    return res.status(400).json({ message: 'Student ID and email are required' });
  }

  const query = 'UPDATE students SET email = ? WHERE enrollment_no = ?';
  db.query(query, [email, enrollment_no], (err, result) => {
    if (err) {
      console.error('Error updating email:', err);
      return res.status(500).json({ message: 'Failed to update email' });
    }

    res.json({ message: 'Email updated successfully', email });
  });
};

// Update student password
exports.updatePassword = (req, res) => {
  const enrollment_no = req.params.id;
  const { password } = req.body;

  if (!enrollment_no || !password) {
    return res.status(400).json({ message: 'Student ID and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const query = 'UPDATE students SET password = ? WHERE enrollment_no = ?';
  db.query(query, [password, enrollment_no], (err, result) => {
    if (err) {
      console.error('Error updating password:', err);
      return res.status(500).json({ message: 'Failed to update password' });
    }

    res.json({ message: 'Password updated successfully' });
  });
};

// Get upcoming deadlines for a student
exports.getUpcomingDeadlines = (req, res) => {
  const enrollment_no = req.params.id;
  if (!enrollment_no) return res.status(400).json({ message: 'Student id is required' });

  // Get student's department and semester
  const studentQuery = 'SELECT department, semester FROM students WHERE enrollment_no = ?';
  db.query(studentQuery, [enrollment_no], (err, studentResults) => {
    if (err) {
      console.error('Error fetching student:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!studentResults || studentResults.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { department, semester } = studentResults[0];

    // Query upcoming assignments (deadline >= today) that haven't been submitted by this student
    const query = `
      SELECT 
        a.assignment_id, 
        a.title, 
        a.subject, 
        a.deadline,
        f.name as faculty_name,
        s.submission_id
      FROM assignments a
      LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
      LEFT JOIN submissions s 
        ON a.assignment_id = s.assignment_id AND s.enrollment_no = ?
      WHERE 
        a.branch = ? 
        AND a.semester = ?
        AND a.deadline >= DATE(NOW())
        AND s.submission_id IS NULL
      ORDER BY a.deadline ASC
      LIMIT 5
    `;

    db.query(query, [enrollment_no, department, semester], (err, results) => {
      if (err) {
        console.error('Error fetching upcoming deadlines:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.json(results);
    });
  });
};
