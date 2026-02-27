const db = require('./config/db');

console.log('Checking dates and assignments...');

db.query('SELECT DATE(NOW()) as today', (err, results) => {
  console.log('Today:', results[0].today);
  
  db.query('SELECT assignment_id, title, deadline, branch, semester FROM assignments ORDER BY deadline DESC LIMIT 5', (err, results) => {
    console.log('Sample assignments:');
    results.forEach(a => {
      const date = new Date(a.deadline);
      const dateStr = date.toISOString().split('T')[0];
      console.log(`  ID: ${a.assignment_id}, Title: ${a.title}, Branch: ${a.branch}, Sem: ${a.semester}, Deadline: ${dateStr}`);
    });
    
    db.end();
  });
});
