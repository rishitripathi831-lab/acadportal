const db = require('../config/db');

exports.login = (req, res) => {
  // Accept flexible id fields from frontend (id OR enrollment_no OR faculty_id)
  let { id, password, role } = req.body;
  if (!id) id = req.body.enrollment_no || req.body.faculty_id || id;
  // normalize inputs
  if (typeof id === 'number') id = String(id);
  if (typeof password === 'string') password = password.trim();

  if (!id || !password || !role) {
    return res.status(400).json({ message: 'ID, password, and role are required.' });
  }

  console.log('Auth login attempt:', { id, role, passwordProvided: !!password });

  // Support both faculty_id and students (enrollment_no or numeric student_id)
  let query;
  let params = [id];
  if (role === 'faculty') {
    query = 'SELECT * FROM faculty WHERE faculty_id = ?';
  } else if (role === 'student') {
    // Try matching enrollment_no first (string IDs like 2023CSE001 or STU001)
    // If `id` looks numeric, allow matching a numeric `student_id` column if present
    if (!isNaN(Number(id))) {
      // numeric id: try student_id if column exists, otherwise fallback to enrollment_no
      query = 'SELECT * FROM students WHERE student_id = ? OR enrollment_no = ?';
      params = [id, id];
    } else {
      query = 'SELECT * FROM students WHERE enrollment_no = ?';
    }
  } else {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!results || results.length === 0) {
      console.log('No user found for query:', query, 'params:', params);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = results[0];
    console.log('User from DB:', { id: user.faculty_id || user.enrollment_no || user.student_id, passwordStored: !!user.password, storedPasswordPreview: String(user.password).slice(0,10) });

    // Ensure both sides are strings and trim whitespace before comparing
    const storedPassword = user.password == null ? '' : String(user.password).trim();
    const providedPassword = password == null ? '' : String(password).trim();

    // In a real application, use bcrypt. For now compare plain text (matches seed data)
    if (providedPassword !== storedPassword) {
      console.log('Password mismatch: provided vs stored', { provided: providedPassword, stored: storedPassword });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Build user details based on available columns
    const user_details = {
      id: user.faculty_id || user.enrollment_no || user.student_id,
      name: user.name,
      role: role,
    };

    res.json({
      message: 'Login successful',
      user: user_details,
    });
  });
};
