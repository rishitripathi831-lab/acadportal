const db = require('./config/db');

// Add a pending submission for testing
const query = `
  INSERT INTO submissions (assignment_id, enrollment_no, submission_date, file_path, grade, similarity_score) 
  VALUES (1, 'STU002', NOW(), 'test_submission.pdf', NULL, 0)
`;

db.query(query, (err, result) => {
  if (err) {
    console.error('Error inserting test submission:', err);
  } else {
    console.log('Test pending submission inserted with ID:', result.insertId);
  }
  process.exit(0);
});
