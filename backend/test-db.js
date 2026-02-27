// backend/test-db.js
// Run: node test-db.js
// This script tests DB connection and verifies table structure

const db = require('./config/db');
const dotenv = require('dotenv');

dotenv.config({ path: './project.env' });

console.log('Testing database connection...\n');

db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection FAILED:', err.message);
    process.exit(1);
  }

  console.log('✅ DB Connected successfully!\n');

  // Test 1: Check if students table exists
  console.log('Checking tables...\n');

  db.query(`DESCRIBE students`, (err, results) => {
    if (err) {
      console.error('❌ students table error:', err.message);
    } else {
      console.log('✅ students table exists. Columns:');
      results.forEach(col => console.log(`   - ${col.Field} (${col.Type})`));
    }

    // Test 2: Check assignments table
    db.query(`DESCRIBE assignments`, (err, results) => {
      if (err) {
        console.error('❌ assignments table error:', err.message);
      } else {
        console.log('\n✅ assignments table exists. Columns:');
        results.forEach(col => console.log(`   - ${col.Field} (${col.Type})`));
      }

      // Test 3: Check marks table
      db.query(`DESCRIBE marks`, (err, results) => {
        if (err) {
          console.error('❌ marks table error:', err.message);
        } else {
          console.log('\n✅ marks table exists. Columns:');
          results.forEach(col => console.log(`   - ${col.Field} (${col.Type})`));
        }

        // Test 4: Count rows in each table
        console.log('\nRow counts:');
        db.query(`SELECT COUNT(*) as count FROM students`, (err, results) => {
          console.log(`  - students: ${err ? 'ERROR' : results[0].count} rows`);

          db.query(`SELECT COUNT(*) as count FROM assignments`, (err, results) => {
            console.log(`  - assignments: ${err ? 'ERROR' : results[0].count} rows`);

            db.query(`SELECT COUNT(*) as count FROM marks`, (err, results) => {
              console.log(`  - marks: ${err ? 'ERROR' : results[0].count} rows`);

              // Test 5: Sample query
              console.log('\nTesting sample query...');
              db.query(
                `SELECT a.assignment_id, a.title, a.subject FROM assignments a LIMIT 2`,
                (err, results) => {
                  if (err) {
                    console.error('❌ Query failed:', err.message);
                  } else {
                    console.log('✅ Query works. Sample data:');
                    console.log(JSON.stringify(results, null, 2));
                  }

                  console.log('\n✅ All tests complete!\n');
                  process.exit(0);
                }
              );
            });
          });
        });
      });
    });
  });
});
