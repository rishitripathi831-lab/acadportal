const db = require('./config/db');

console.log('Migrating marks table schema...');

// Add new columns to marks table to store both obtained marks and total marks
const migrations = [
  {
    sql: `ALTER TABLE marks ADD COLUMN mid1_marks INT DEFAULT NULL`,
    description: 'Add mid1_marks column',
    ignoreError: 'ER_DUP_FIELDNAME'
  },
  {
    sql: `ALTER TABLE marks ADD COLUMN mid1_total INT DEFAULT 30`,
    description: 'Add mid1_total column (default 30)',
    ignoreError: 'ER_DUP_FIELDNAME'
  },
  {
    sql: `ALTER TABLE marks ADD COLUMN mid2_marks INT DEFAULT NULL`,
    description: 'Add mid2_marks column',
    ignoreError: 'ER_DUP_FIELDNAME'
  },
  {
    sql: `ALTER TABLE marks ADD COLUMN mid2_total INT DEFAULT 30`,
    description: 'Add mid2_total column (default 30)',
    ignoreError: 'ER_DUP_FIELDNAME'
  }
];

let completed = 0;

migrations.forEach((migration, index) => {
  db.query(migration.sql, (err) => {
    if (err) {
      if (migration.ignoreError && err.code === migration.ignoreError) {
        console.log(`✓ ${migration.description} (already exists)`);
      } else {
        console.error(`✗ ${migration.description}:`, err.message);
      }
    } else {
      console.log(`✓ ${migration.description}`);
    }
    
    completed++;
    if (completed === migrations.length) {
      // Verify the schema
      console.log('\nVerifying schema...');
      db.query(`DESCRIBE marks`, (err, columns) => {
        if (err) {
          console.error('Error describing marks table:', err);
          process.exit(1);
        }
        console.log('\nMarks table columns:');
        columns.forEach(col => {
          console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        process.exit(0);
      });
    }
  });
});
