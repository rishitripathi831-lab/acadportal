const db = require('./config/db');

const enrollmentNo = '2023CSE001';

const studentQuery = 'SELECT department, semester FROM students WHERE enrollment_no = ?';
db.query(studentQuery, [enrollmentNo], (err, studentResults) => {
  const { department, semester } = studentResults[0];
  
  const query = `
    SELECT 
      a.assignment_id, 
      a.title, 
      a.subject, 
      a.deadline
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
    console.log('Upcoming for 2023CSE001:');
    console.log(JSON.stringify(results, null, 2));
    db.end();
  });
});
