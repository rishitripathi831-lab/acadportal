const fs = require('fs');
const filePath = 'controllers/marksController.js';
let content = fs.readFileSync(filePath, 'utf8');

// Add logging to getMarksByClass
const searchStr = `// Get marks for all students in a class for a given subject
const getMarksByClass = (req, res) => {
  const { branch, semester, subject } = req.query;
  if (!branch || !semester) return res.status(400).json({ message: 'branch and semester required' });

  const sub = subject || 'Internal';`;

const replaceStr = `// Get marks for all students in a class for a given subject
const getMarksByClass = (req, res) => {
  console.log('=== getMarksByClass called ===');
  console.log('req.query =', req.query);
  const { branch, semester, subject } = req.query;
  console.log('Extracted: branch="%s", semester="%s" (type:%s)', branch, semester, typeof semester);
  if (!branch || !semester) return res.status(400).json({ message: 'branch and semester required' });

  const sub = subject || 'Internal';
  const semesterNum = parseInt(semester);
  console.log('Using: department="%s", semester=%d', branch, semesterNum);`;

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  
  // Also update the db.query call to use semesterNum
  const querySearch = `  db.query(query, [sub, branch, semester], (err, results) => {`;
  const queryReplace = `  console.log('Executing with params:', [sub, branch, semesterNum]);
  db.query(query, [sub, branch, semesterNum], (err, results) => {
    if (err) {
      console.error('Error fetching marks by class:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    console.log('Query returned %d students', results ? results.length : 0);
    return res.json(results || []);
  });`;

  // Find and replace the db.query call
  const querySection = content.substring(content.indexOf('db.query(query, [sub, branch'));
  const endOfBlock = querySection.indexOf('});') + 3;
  const oldBlock = querySection.substring(0, endOfBlock);
  
  content = content.replace(oldBlock, queryReplace);
  
  fs.writeFileSync(filePath, content);
  console.log('✓ marksController.js updated successfully');
} else {
  console.log('❌ Could not find search string');
}
