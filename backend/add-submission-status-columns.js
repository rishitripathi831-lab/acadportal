const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ path: './project.env' });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
  console.log('Connected to database:', process.env.DB_NAME);

//check if column already exist

  const checkQuery = `
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'submissions' 
    AND TABLE_SCHEMA = ?
    AND COLUMN_NAME IN ('status', 'evaluated_at')
  `;

  db.query(checkQuery, [process.env.DB_NAME], (err, results) => {
    if (err) {
      console.error('Error checking columns:', err);
      db.end();
      process.exit(1);
    }

    const hasStatus = results.some(r => r.COLUMN_NAME === 'status');
    const hasEvaluatedAt = results.some(r => r.COLUMN_NAME === 'evaluated_at');

    if (hasStatus && hasEvaluatedAt) {
      console.log('✓ Columns "status" and "evaluated_at" already exist');
      db.end();
      process.exit(0);
    }

    let alterQuery = 'ALTER TABLE submissions ';
    const changes = [];

    if (!hasStatus) {
      changes.push("ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");
    }
    if (!hasEvaluatedAt) {
      changes.push("ADD COLUMN evaluated_at DATETIME");
    }

    alterQuery += changes.join(', ');

    console.log('Executing:', alterQuery);

    db.query(alterQuery, (err, result) => {
      if (err) {
        console.error('Error altering table:', err);
        db.end();
        process.exit(1);
      }

      console.log('✓ Migration completed successfully');
      console.log('Added columns:');
      if (!hasStatus) console.log('  - status (VARCHAR(50), DEFAULT "Pending")');
      if (!hasEvaluatedAt) console.log('  - evaluated_at (DATETIME)');

      db.end();
      process.exit(0);
    });
  });
});
