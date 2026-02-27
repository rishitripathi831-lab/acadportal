const db = require('./config/db');

// Test the getUpcomingDeadlines logic
const enrollmentNo = 'STU001';

const studentQuery = 'SELECT department, semester FROM students WHERE enrollment_no = ?';
db.query(studentQuery, [enrollmentNo], (err, studentResults) => {
  if (err) {
    console.error('Error fetching student:', err);
    db.end();
    return;
  }

  if (!studentResults || studentResults.length === 0) {
    console.log('Student not found');
    db.end();
    return;
  }

  const { department, semester } = studentResults[0];
  console.log(`Student: ${enrollmentNo}, Department: ${department}, Semester: ${semester}`);
  console.log('---');

  // Query upcoming assignments
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

  db.query(query, [enrollmentNo, department, semester], (err, results) => {
    if (err) {
      console.error('Error fetching upcoming deadlines:', err);
      db.end();
      return;
    }

    console.log(`Upcoming Deadlines for ${enrollmentNo}:`);
    console.log(JSON.stringify(results, null, 2));
    db.end();
  });
});
