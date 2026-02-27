const db = require('../config/db');

// Simple hardcoded admin login for demo purposes
exports.login = (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ message: 'id and password required' });

  // Hardcoded credentials (can be moved to env or DB)
  if (id === 'admin' && password === 'admin@123') {
    return res.json({ message: 'Admin login successful', user: { id: 'admin', name: 'Administrator', role: 'admin' } });
  }
  return res.status(401).json({ message: 'Invalid admin credentials' });
};

// Add a faculty (admin only)
exports.addFaculty = (req, res) => {
  const { faculty_id, name, email, password } = req.body;
  console.log('Adding faculty:', { faculty_id, name, email });
  
  if (!faculty_id || !name || !password) {
    console.error('Missing required fields:', { faculty_id, name, password: !!password });
    return res.status(400).json({ message: 'Missing required faculty fields (id, name, password)' });
  }

  const query = 'INSERT INTO faculty (faculty_id, name, password) VALUES (?, ?, ?)';
  db.query(query, [faculty_id, name, password], (err, result) => {
    if (err) {
      console.error('Database error adding faculty:', err);
      return res.status(500).json({ message: 'Failed to add faculty', error: err.message });
    }
    console.log('Faculty added successfully:', faculty_id);
    return res.status(201).json({ message: 'Faculty added successfully', faculty_id });
  });
};

// Add a student (admin only)
exports.addStudent = (req, res) => {
  const { enrollment_no, name, department, semester, password } = req.body;
  console.log('Adding student:', { enrollment_no, name, department, semester });
  
  if (!enrollment_no || !name || !department || !semester || !password) {
    console.error('Missing required fields:', { enrollment_no, name, department, semester, password: !!password });
    return res.status(400).json({ message: 'Missing required student fields' });
  }

  const query = 'INSERT INTO students (enrollment_no, name, password, department, semester) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [enrollment_no, name, password, department, semester], (err, result) => {
    if (err) {
      console.error('Database error adding student:', err);
      return res.status(500).json({ message: 'Failed to add student', error: err.message });
    }
    console.log('Student added successfully:', enrollment_no);
    return res.status(201).json({ message: 'Student added successfully', enrollment_no });
  });
};

// Get all students
exports.getAllStudents = (req, res) => {
  const query = 'SELECT enrollment_no, name, department, semester FROM students ORDER BY enrollment_no';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching students:', err);
      return res.status(500).json({ message: 'Failed to fetch students', error: err.message });
    }
    return res.json(results || []);
  });
};

// Get all faculty
exports.getAllFaculty = (req, res) => {
  const query = 'SELECT faculty_id, name FROM faculty ORDER BY faculty_id';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching faculty:', err);
      return res.status(500).json({ message: 'Failed to fetch faculty', error: err.message });
    }
    return res.json(results || []);
  });
};

// Update a student
exports.updateStudent = (req, res) => {
  const { enrollment_no } = req.params;
  const { name, department, semester } = req.body;
  
  if (!enrollment_no || !name || !department || !semester) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const query = 'UPDATE students SET name = ?, department = ?, semester = ? WHERE enrollment_no = ?';
  db.query(query, [name, department, semester, enrollment_no], (err, result) => {
    if (err) {
      console.error('Database error updating student:', err);
      return res.status(500).json({ message: 'Failed to update student', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.json({ message: 'Student updated successfully' });
  });
};

// Update a faculty member
exports.updateFaculty = (req, res) => {
  const { faculty_id } = req.params;
  const { name } = req.body;
  
  if (!faculty_id || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const query = 'UPDATE faculty SET name = ? WHERE faculty_id = ?';
  db.query(query, [name, faculty_id], (err, result) => {
    if (err) {
      console.error('Database error updating faculty:', err);
      return res.status(500).json({ message: 'Failed to update faculty', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    return res.json({ message: 'Faculty updated successfully' });
  });
};

// Delete a student
exports.deleteStudent = (req, res) => {
  const { enrollment_no } = req.params;
  
  if (!enrollment_no) {
    return res.status(400).json({ message: 'Enrollment number required' });
  }
  
  console.log('Attempting to delete student:', enrollment_no);
  
  // Delete marks first (related to submissions)
  const deleteMarksQuery = `
    DELETE m FROM marks m 
    INNER JOIN submissions s ON m.submission_id = s.id 
    WHERE s.enrollment_no = ?
  `;
  db.query(deleteMarksQuery, [enrollment_no], (err) => {
    if (err) {
      console.error('Error deleting marks:', err.message);
      // Continue even if marks delete fails (might not have any marks)
    } else {
      console.log('Marks deleted successfully');
    }
    
    // Delete submissions
    const deleteSubmissionsQuery = 'DELETE FROM submissions WHERE enrollment_no = ?';
    db.query(deleteSubmissionsQuery, [enrollment_no], (err) => {
      if (err) {
        console.error('Error deleting submissions:', err.message);
        return res.status(500).json({ message: 'Failed to delete submissions', error: err.message });
      }
      console.log('Submissions deleted successfully');
      
      // Delete student
      const deleteStudentQuery = 'DELETE FROM students WHERE enrollment_no = ?';
      db.query(deleteStudentQuery, [enrollment_no], (err, result) => {
        if (err) {
          console.error('Error deleting student:', err.message);
          return res.status(500).json({ message: 'Failed to delete student', error: err.message });
        }
        console.log('Delete result:', result);
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Student not found' });
        }
        return res.json({ message: 'Student and related data deleted successfully' });
      });
    });
  });
};

// Delete a faculty member
exports.deleteFaculty = (req, res) => {
  const { faculty_id } = req.params;
  
  if (!faculty_id) {
    return res.status(400).json({ message: 'Faculty ID required' });
  }
  
  console.log('Attempting to delete faculty:', faculty_id);
  
  // First, delete all assignments (and their related submissions/marks will cascade)
  const deleteAssignmentsQuery = 'DELETE FROM assignments WHERE faculty_id = ?';
  db.query(deleteAssignmentsQuery, [faculty_id], (err) => {
    if (err) {
      console.error('Error deleting assignments:', err.message);
      return res.status(500).json({ message: 'Failed to delete assignments', error: err.message });
    }
    console.log('Assignments deleted');
    
    // Then delete the faculty
    const deleteFacultyQuery = 'DELETE FROM faculty WHERE faculty_id = ?';
    db.query(deleteFacultyQuery, [faculty_id], (err, result) => {
      if (err) {
        console.error('Error deleting faculty:', err.message);
        return res.status(500).json({ message: 'Failed to delete faculty', error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Faculty not found' });
      }
      console.log('Faculty deleted successfully');
      return res.json({ message: 'Faculty deleted successfully' });
    });
  });
};
