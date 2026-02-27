const db = require('./config/db');

const enrollmentNo = 'STU001';

console.log(`Testing upcoming deadlines for: ${enrollmentNo}`);

const studentQuery = 'SELECT department, semester FROM students WHERE enrollment_no = ?';
db.query(studentQuery, [enrollmentNo], (err, studentResults) => {
  if (!studentResults || studentResults.length === 0) {
    console.log('Student not found');
    db.end();
    return;
  }

  const { department, semester } = studentResults[0];
  console.log(`Student department: ${department}, semester: ${semester}`);

  // Check all assignments for this dept/semester
  db.query('SELECT assignment_id, title, deadline FROM assignments WHERE branch = ? AND semester = ?', [department, semester], (err, allAssignments) => {
    console.log('All assignments for this dept/sem:');
    allAssignments.forEach(a => {
      const date = new Date(a.deadline);
      console.log(`  - ${a.title}: ${date.toISOString()}`);
    });

    // Check which ones are already submitted
    db.query('SELECT assignment_id FROM submissions WHERE enrollment_no = ?', [enrollmentNo], (err, submitted) => {
      console.log('Already submitted:', submitted.map(s => s.assignment_id));

      // Now run the actual query
      const query = `
        SELECT 
          a.assignment_id, 
          a.title, 
          a.deadline,
          s.submission_id
        FROM assignments a
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
        console.log('\nUpcoming (not submitted) results:');
        console.log(JSON.stringify(results, null, 2));
        db.end();
      });
    });
  });
});
