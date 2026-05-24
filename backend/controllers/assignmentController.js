const db = require("../config/db");
const path = require('path');
const sendAssignmentEmail =
require("../services/emailService");

const createAssignment = (req, res) => {
  console.log('--- createAssignment called ---');
  console.log('req.body =', req.body);
  console.log('req.file =', req.file);
  const { title, subject, deadline, faculty_id, branch, semester, year } = req.body;

  if (!title || !deadline || !faculty_id || !branch || !semester) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Get uploaded file path if exists (safe handling)
  const assignment_file = req.file ? req.file.filename : null;
  const assignment_file_path = req.file ? path.join('uploads', 'assignments', req.file.filename) : null;

  // Insert with all fields including the new ones
  const insertQuery = `
    INSERT INTO assignments (title, subject, deadline, faculty_id, branch, semester, year, created_at, assignment_file)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
  `;

  db.query(insertQuery, [title, subject || null, deadline, faculty_id, branch, semester, year || null, assignment_file], (err, result) => {
    if (err) {
      console.error('Error inserting assignment:', err && err.stack ? err.stack : err);
      return res.status(500).json({ message: 'Failed to create assignment', error: err.message || err });
    }
    console.log('Assignment inserted id=', result.insertId, 'file=', assignment_file, 'file_path=', assignment_file_path);
    const studentQuery = ` 
    SELECT email

FROM students

WHERE department = ?
AND semester = ?

`;

db.query(

  studentQuery,

  [branch, semester],

  async (studentErr, students) => {

    if (studentErr) {

      console.error(
        "Student fetch error:",
        studentErr
      );

    } else {

      console.log(
        "Students fetched:",
        students
      );

      for (const student of students) {

        if (student.email) {

          console.log(
            "Sending email to:",
            student.email
          );

          await sendAssignmentEmail(

            student.email,

            {

              title,

              subject,

              deadline,

              branch,

              semester,

            }

          );

        }

      }

    }

  }

);
    return res.status(201).json({ success: true, message: 'Assignment created successfully', assignment_id: result.insertId });
  });
};

const getAssignmentsByClass = (req, res) => {
  const { class_id } = req.params;

  const query = "SELECT * FROM assignments WHERE class_id = ?";
  db.query(query, [class_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// NEW: Get all assignments by faculty ID
const getAssignmentsByFaculty = (req, res) => {
  const { faculty_id } = req.params;

  const query = `
    SELECT 
      a.assignment_id,
      a.title,
      a.subject,
      a.deadline,
      a.faculty_id,
      a.branch,
      a.semester,
      COUNT(DISTINCT s.submission_id) as submitted,
      (SELECT COUNT(*) FROM students st WHERE st.department = a.branch AND st.semester = a.semester) as total_students,
      (SELECT COUNT(*) FROM submissions s2 WHERE s2.assignment_id = a.assignment_id AND s2.status != 'Checked') as pending
    FROM assignments a
    LEFT JOIN submissions s ON a.assignment_id = s.assignment_id
    WHERE a.faculty_id = ?
    GROUP BY a.assignment_id, a.title, a.subject, a.deadline, a.faculty_id, a.branch, a.semester
    ORDER BY a.deadline DESC
  `;

  db.query(query, [faculty_id], (err, results) => {
    if (err) {
      console.error('Error fetching assignments by faculty:', err);
      return res.status(500).json({ error: err.message });
    }
    
    // Log each result for debugging
    if (results && results.length > 0) {
      results.forEach(row => {
        console.log('Assignment: id=%d, branch=%s, semester=%d, submitted=%d, total=%d, pending=%d', 
          row.assignment_id, row.branch, row.semester, row.submitted, row.total_students, row.pending);
      });
    }
    
    res.json(results || []);
  });
};

// NEW: Get assignment details with submissions
const getAssignmentDetails = (req, res) => {
  const { assignment_id } = req.params;

  const query = `
    SELECT 
      a.assignment_id,
      a.title,
      a.subject,
      a.deadline,
      a.faculty_id,
      f.name as faculty_name
    FROM assignments a
    LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
    WHERE a.assignment_id = ?
  `;

  db.query(query, [assignment_id], (err, results) => {
    if (err) {
      console.error('Error fetching assignment details:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(results[0]);
  });
};

// NEW: Get submission statistics for an assignment
// FIX: Calculate pending count directly without subtraction to avoid -1 bug
const getSubmissionStats = (req, res) => {
  const { assignment_id } = req.params;

  // Step 1: Get assignment branch and semester
  const assignmentQuery = `
    SELECT branch, semester
    FROM assignments
    WHERE assignment_id = ?
  `;

  db.query(assignmentQuery, [assignment_id], (err, assignmentResults) => {
    if (err) {
      console.error('Error fetching assignment:', err && err.stack ? err.stack : err);
      return res.status(500).json({ error: err.message || err });
    }

    if (!assignmentResults || assignmentResults.length === 0) {
      console.log('Assignment not found: assignment_id=%d', assignment_id);
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment = assignmentResults[0];
    const branch = assignment.branch;
    const semester = assignment.semester;

    console.log('Getting stats for assignment_id=%d, branch=%s, semester=%d', assignment_id, branch, semester);

    // Step 2: Get submitted count, total students, and pending count using the branch/semester
    const statsQuery = `
      SELECT 
        COALESCE((SELECT COUNT(DISTINCT enrollment_no) FROM submissions WHERE assignment_id = ?), 0) as submitted,
        COALESCE((SELECT COUNT(*) FROM students WHERE department = ? AND semester = ?), 0) as total_students,
        COALESCE((SELECT COUNT(*) FROM students WHERE department = ? AND semester = ? AND enrollment_no NOT IN (SELECT DISTINCT enrollment_no FROM submissions WHERE assignment_id = ?)), 0) as pending
      LIMIT 1
    `;

    db.query(statsQuery, [assignment_id, branch, semester, branch, semester, assignment_id], (err, results) => {
      if (err) {
        console.error('Error fetching submission stats:', err && err.stack ? err.stack : err);
        return res.status(500).json({ error: err.message || err });
      }

      const row = results[0] || { submitted: 0, total_students: 0, pending: 0 };
      const submitted = Math.max(0, row.submitted || 0);
      const total_students = Math.max(0, row.total_students || 0);
      const pending = Math.max(0, row.pending || 0);

      console.log('Submission stats: assignment_id=%d, branch=%s, semester=%d, submitted=%d, total=%d, pending=%d', 
        assignment_id, branch, semester, submitted, total_students, pending);

      res.json({ submitted, total_students, pending });
    });
  });
};

// NEW: Get student submission list for an assignment
const getSubmissionList = (req, res) => {
  const { assignment_id } = req.params;

  // We need to list students for the class this assignment was assigned to
  const query = `
    SELECT 
      st.enrollment_no,
      st.name,
      s.submission_id,
      s.submission_date,
      s.grade,
      s.similarity_score,
      CASE WHEN s.submission_id IS NOT NULL THEN 'Submitted' ELSE 'Pending' END as status
    FROM assignments a
    JOIN students st ON st.department = a.branch AND st.semester = a.semester
    LEFT JOIN submissions s ON st.enrollment_no = s.enrollment_no AND s.assignment_id = ?
    WHERE a.assignment_id = ?
    ORDER BY st.enrollment_no
  `;

  db.query(query, [assignment_id, assignment_id], (err, results) => {
    if (err) {
      console.error('Error fetching submission list:', err && err.stack ? err.stack : err);
      return res.status(500).json({ error: err.message || err });
    }
    res.json(results || []);
  });
};

module.exports = { 
  createAssignment, 
  getAssignmentsByClass,
  getAssignmentsByFaculty,
  getAssignmentDetails,
  getSubmissionStats,
  getSubmissionList
};
