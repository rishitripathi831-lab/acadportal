const db = require("../config/db");

// Student uploads assignment submission
const submitAssignment = (req, res) => {
  const { assignment_id, enrollment_no } = req.body;

  console.log('--- submitAssignment called ---');
  console.log('assignment_id:', assignment_id, 'enrollment_no:', enrollment_no);
  console.log('req.file:', req.file);

  if (!assignment_id || !enrollment_no) {
    return res.status(400).json({ message: 'Missing required fields: assignment_id, enrollment_no' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // CRITICAL: Fetch assignment deadline and validate BEFORE allowing submission
  const deadlineQuery = 'SELECT deadline FROM assignments WHERE assignment_id = ?';
  db.query(deadlineQuery, [assignment_id], (err, deadlineResults) => {
    if (err) {
      console.error('Error fetching assignment deadline:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!deadlineResults || deadlineResults.length === 0) {
      console.error('Assignment not found: assignment_id=%d', assignment_id);
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const deadline = deadlineResults[0].deadline;
    const currentTime = new Date();
    const deadlineTime = new Date(deadline);

    console.log('Deadline check: deadline=%s, currentTime=%s', deadline, currentTime.toISOString());

    // HARD BLOCK: Reject submission if deadline has passed
    if (currentTime > deadlineTime) {
      console.log('Submission rejected: deadline passed for assignment_id=%d', assignment_id);
      return res.status(403).json({ 
        success: false, 
        message: 'Assignment deadline has passed. No submissions are allowed.' 
      });
    }

    // Deadline OK, proceed with submission
    const file_path = `uploads/submissions/${req.file.filename}`;

    // Check if student already submitted
    const checkQuery = `SELECT submission_id FROM submissions WHERE assignment_id = ? AND enrollment_no = ?`;
    db.query(checkQuery, [assignment_id, enrollment_no], (err, results) => {
      if (err) {
        console.error('Error checking existing submission:', err && err.stack ? err.stack : err);
        return res.status(500).json({ error: err.message || err });
      }

      if (results.length > 0) {
        // Update existing submission
        const updateQuery = `
          UPDATE submissions 
          SET file_path = ?, submission_date = NOW(), grade = NULL
          WHERE assignment_id = ? AND enrollment_no = ?
        `;
        db.query(updateQuery, [file_path, assignment_id, enrollment_no], (err, result) => {
          if (err) {
            console.error('Error updating submission:', err && err.stack ? err.stack : err);
            return res.status(500).json({ error: err.message || err });
          }
          console.log('Submission updated: assignment_id=%d, enrollment_no=%s, file_path=%s', assignment_id, enrollment_no, file_path);
          res.status(200).json({ 
            success: true, 
            message: 'Assignment resubmitted successfully', 
            submission_id: results[0].submission_id 
          });
        });
      } else {
        // Create new submission
        const insertQuery = `
          INSERT INTO submissions (assignment_id, enrollment_no, file_path, submission_date, grade, similarity_score)
          VALUES (?, ?, ?, NOW(), NULL, 0)
        `;
        db.query(insertQuery, [assignment_id, enrollment_no, file_path], (err, result) => {
          if (err) {
            console.error('Error creating submission:', err && err.stack ? err.stack : err);
            return res.status(500).json({ error: err.message || err });
          }
          console.log('Submission created: submission_id=%d, file_path=%s', result.insertId, file_path);
          res.status(201).json({ 
            success: true, 
            message: 'Assignment submitted successfully', 
            submission_id: result.insertId 
          });
        });
      }
    });
  });
};

// Get all pending submissions for a faculty
const getPendingSubmissions = (req, res) => {
  const { faculty_id } = req.params;

  const query = `
    SELECT 
      s.submission_id,
      s.assignment_id,
      s.enrollment_no,
      s.submission_date,
      s.grade,
      s.similarity_score,
      s.file_path,
      st.name as student_name,
      a.title as assignment_title,
      a.branch,
      a.semester,
      'Pending' as status
    FROM submissions s
    JOIN students st ON st.enrollment_no = s.enrollment_no
    JOIN assignments a ON a.assignment_id = s.assignment_id
    WHERE a.faculty_id = ? AND s.grade IS NULL
    ORDER BY s.submission_date DESC
  `;

  db.query(query, [faculty_id], (err, results) => {
    if (err) {
      console.error('Error fetching pending submissions:', err && err.stack ? err.stack : err);
      return res.status(500).json({ error: err.message || err });
    }
    console.log('Pending submissions for faculty_id=%d: %d rows', faculty_id, results.length);
    res.json(results || []);
  });
};

// Get submission details
const getSubmissionDetails = (req, res) => {
  const { submission_id } = req.params;

  const query = `
    SELECT 
      s.submission_id,
      s.assignment_id,
      s.enrollment_no,
      s.submission_date,
      s.file_path,
      s.grade,
      s.similarity_score,
      s.status,
      s.evaluated_at,
      st.name as student_name,
      st.enrollment_no,
      st.department,
      st.semester,
      a.title as assignment_title,
      a.subject,
      a.deadline
    FROM submissions s
    JOIN students st ON st.enrollment_no = s.enrollment_no
    JOIN assignments a ON a.assignment_id = s.assignment_id
    WHERE s.submission_id = ?
  `;

  db.query(query, [submission_id], (err, results) => {
    if (err) {
      console.error('Error fetching submission details:', err && err.stack ? err.stack : err);
      return res.status(500).json({ error: err.message || err });
    }
    const submission = results[0] || null;
    console.log('Submission details for submission_id=%d:', submission_id, submission ? 'found' : 'not found');
    res.json(submission);
  });
};

// Mark submission as checked (evaluated)
const markSubmissionChecked = (req, res) => {
  const { submission_id } = req.body;
  const facultyId = req.body.faculty_id; // Passed from frontend

  console.log('--- markSubmissionChecked called ---');
  console.log('req.body:', JSON.stringify(req.body));
  console.log('submission_id:', submission_id, 'faculty_id:', facultyId);

  if (!submission_id) {
    return res.status(400).json({ message: 'Missing submission_id' });
  }

  // First, verify this submission belongs to the logged-in faculty
  const verifyQuery = `
    SELECT s.submission_id 
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.assignment_id
    WHERE s.submission_id = ? AND a.faculty_id = ?
  `;

  db.query(verifyQuery, [submission_id, facultyId], (err, results) => {
    if (err) {
      console.error('Error verifying submission ownership:', err && err.stack ? err.stack : err);
      return res.status(500).json({ error: err.message || err });
    }

    if (!results || results.length === 0) {
      console.log('Submission not found or does not belong to faculty:', facultyId);
      return res.status(403).json({ message: 'Submission not found or you do not have permission to update it' });
    }

    // Update submission status to 'Checked'
    const updateQuery = `
      UPDATE submissions
      SET status = 'Checked', evaluated_at = NOW()
      WHERE submission_id = ?
    `;

    db.query(updateQuery, [submission_id], (err, result) => {
      if (err) {
        console.error('Error marking submission as checked:', err);
        console.error('Error details - code:', err.code, 'sqlState:', err.sqlState, 'sqlMessage:', err.sqlMessage);
        return res.status(500).json({ error: err.message || err, sqlMessage: err.sqlMessage });
      }

      console.log('Update result:', JSON.stringify(result));
      console.log('Submission marked as checked: submission_id=%d', submission_id);
      res.json({ 
        success: true, 
        message: 'Submission marked as checked', 
        submission_id: submission_id,
        status: 'Checked',
        evaluated_at: new Date().toISOString()
      });
    });
  });
};

// Get all submissions for a student
const getStudentSubmissions = (req, res) => {
  const { enrollment_no } = req.params;

  const query = `
    SELECT 
      s.submission_id,
      s.assignment_id,
      s.enrollment_no,
      s.submission_date,
      s.file_path,
      s.grade,
      s.similarity_score,
      s.status,
      s.evaluated_at,
      a.title as assignment_title,
      a.subject
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.assignment_id
    WHERE s.enrollment_no = ?
    ORDER BY s.submission_date DESC
  `;

  db.query(query, [enrollment_no], (err, results) => {
    if (err) {
      console.error('Error fetching student submissions:', err);
      return res.status(500).json({ error: err.message || err });
    }
    console.log('Student submissions for enrollment_no=%s: %d rows', enrollment_no, results.length);
    res.json(results || []);
  });
};

module.exports = {
  submitAssignment,
  getPendingSubmissions,
  getSubmissionDetails,
  markSubmissionChecked,
  getStudentSubmissions,
  markSubmissionChecked,
};
