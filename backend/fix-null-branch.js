const db = require('./config/db');

console.log('Fixing NULL branch/semester in assignments...');

db.query(
  'UPDATE assignments SET branch = ?, semester = ? WHERE branch IS NULL',
  ['CSE', 3],
  (err, result) => {
    if (err) {
      console.error('Error updating assignments:', err);
      process.exit(1);
    }
    console.log('Updated', result.affectedRows, 'assignments');

    // Verify the fix
    db.query(
      'SELECT assignment_id, title, branch, semester FROM assignments',
      (err2, assignments) => {
        if (err2) {
          console.error('Error fetching assignments:', err2);
          process.exit(1);
        }
        console.log('\nAssignments after fix:');
        assignments.forEach(a => {
          console.log(`  id=${a.assignment_id}, title="${a.title}", branch="${a.branch}", semester=${a.semester}`);
        });

        // Now test the total_students count
        db.query(
          'SELECT COUNT(*) as total FROM students WHERE department = ? AND semester = ?',
          ['CSE', 3],
          (err3, countResult) => {
            if (err3) {
              console.error('Error counting students:', err3);
              process.exit(1);
            }
            console.log('\nTotal students in CSE semester 3:', countResult[0].total);
            process.exit(0);
          }
        );
      }
    );
  }
);
