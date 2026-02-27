const db = require('../config/db');

// Insert or update marks for a student and subject
// Supports partial updates (exam_type + obtained_marks + total_marks)
const upsertMarks = (req, res) => {
  const { enrollment_no, subject, exam_type, obtained_marks, total_marks, marks } = req.body;
  
  if (!enrollment_no || !subject) {
    return res.status(400).json({ message: 'enrollment_no and subject required' });
  }

  // Normalize and trim subject
  const subjectNormalized = String(subject).trim();
  if (!subjectNormalized) {
    return res.status(400).json({ message: 'subject cannot be empty' });
  }

  let updateFields = {};
  
  if (exam_type && (obtained_marks !== undefined || marks !== undefined)) {
    // New format with obtained and total marks
    const obtainedVal = obtained_marks !== undefined ? obtained_marks : marks;
    const totalVal = total_marks !== undefined ? total_marks : 30;
    
    console.log('Partial update: exam_type=%s, subject=%s, obtained=%d, total=%d', exam_type, subjectNormalized, obtainedVal, totalVal);
    
    // Validate marks
    if (obtainedVal > totalVal) {
      return res.status(400).json({ message: 'Obtained marks cannot exceed total marks' });
    }
    if (obtainedVal < 0 || totalVal <= 0) {
      return res.status(400).json({ message: 'Marks must be positive values' });
    }
    
    if (exam_type === 'mid1') {
      updateFields.mid1_marks = obtainedVal;
      updateFields.mid1_total = totalVal;
    } else if (exam_type === 'mid2') {
      updateFields.mid2_marks = obtainedVal;
      updateFields.mid2_total = totalVal;
    } else {
      return res.status(400).json({ message: 'Invalid exam_type. Must be mid1 or mid2' });
    }
  } else {
    return res.status(400).json({ message: 'Must provide exam_type with obtained_marks and total_marks' });
  }

  // Use enrollment_no + subject as composite key
  const checkQuery = 'SELECT marks_id FROM marks WHERE enrollment_no = ? AND subject = ?';
  db.query(checkQuery, [enrollment_no, subjectNormalized], (err, results) => {
    if (err) {
      console.error('Error checking marks row:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length > 0) {
      // UPDATE existing row
      let setClause = [];
      let params = [];
      
      Object.entries(updateFields).forEach(([field, value]) => {
        setClause.push(`${field} = ?`);
        params.push(value);
      });
      
      params.push(enrollment_no);
      params.push(subjectNormalized);
      
      const updateQuery = `UPDATE marks SET ${setClause.join(', ')} WHERE enrollment_no = ? AND subject = ?`;
      
      console.log('Update query:', updateQuery, 'params:', params);
      
      db.query(updateQuery, params, (err2) => {
        if (err2) {
          console.error('Error updating marks:', err2);
          return res.status(500).json({ message: 'Failed to update marks' });
        }
        
        // Return updated marks so frontend can display immediately
        const selectQuery = 'SELECT * FROM marks WHERE enrollment_no = ? AND subject = ?';
        db.query(selectQuery, [enrollment_no, subjectNormalized], (err3, updatedRows) => {
          if (err3 || !updatedRows.length) {
            return res.json({ message: 'Marks updated' });
          }
          return res.json({ message: 'Marks updated', data: updatedRows[0] });
        });
      });
    } else {
      // INSERT new row
      const fieldsToInsert = ['enrollment_no', 'subject'];
      const placeholders = ['?', '?'];
      const insertParams = [enrollment_no, subjectNormalized];
      
      Object.entries(updateFields).forEach(([field, value]) => {
        fieldsToInsert.push(field);
        placeholders.push('?');
        insertParams.push(value);
      });
      
      const insertQuery = `INSERT INTO marks (${fieldsToInsert.join(', ')}) VALUES (${placeholders.join(', ')})`;
      
      console.log('Insert query:', insertQuery, 'params:', insertParams);
      
      db.query(insertQuery, insertParams, (err3) => {
        if (err3) {
          console.error('Error inserting marks:', err3);
          return res.status(500).json({ message: 'Failed to insert marks' });
        }
        
        // Return inserted marks so frontend can display immediately
        const selectQuery = 'SELECT * FROM marks WHERE enrollment_no = ? AND subject = ?';
        db.query(selectQuery, [enrollment_no, subjectNormalized], (err4, insertedRows) => {
          if (err4 || !insertedRows.length) {
            return res.json({ message: 'Marks inserted' });
          }
          return res.json({ message: 'Marks inserted', data: insertedRows[0] });
        });
      });
    }
  });
};

// Get marks for all students in a class for a given subject
const getMarksByClass = (req, res) => {
  console.log('=== getMarksByClass called ===');
  console.log('req.query =', req.query);
  const { branch, semester, subject } = req.query;
  console.log('Extracted: branch="%s", semester="%s" (type:%s), subject="%s"', branch, semester, typeof semester, subject);
  
  if (!branch || !semester) {
    return res.status(400).json({ message: 'branch and semester required' });
  }

  if (!subject) {
    return res.status(400).json({ message: 'subject required' });
  }

  const subjectNormalized = String(subject).trim();
  const semesterNum = parseInt(semester);
  console.log('Using: department="%s", semester=%d, subject="%s"', branch, semesterNum, subjectNormalized);
  
  const query = `
    SELECT st.enrollment_no, st.name, 
           m.mid1_marks, m.mid1_total, m.mid2_marks, m.mid2_total,
           m.mid_term_1, m.mid_term_2,
           m.subject
    FROM students st
    LEFT JOIN marks m ON st.enrollment_no = m.enrollment_no AND m.subject = ?
    WHERE st.department = ? AND st.semester = ?
    ORDER BY st.enrollment_no
  `;

  console.log('Executing with params:', [subjectNormalized, branch, semesterNum]);
  db.query(query, [subjectNormalized, branch, semesterNum], (err, results) => {
    if (err) {
      console.error('Error fetching marks by class:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    console.log('Query returned %d students', results ? results.length : 0);
    return res.json(results || []);
  });
};

// Get marks for a student (for student dashboard)
const getMarksForStudent = (req, res) => {
  const { enrollment_no } = req.params;
  if (!enrollment_no) return res.status(400).json({ message: 'enrollment_no required' });

  const query = `SELECT subject, 
                   mid1_marks, mid1_total, mid2_marks, mid2_total,
                   mid_term_1, mid_term_2 
                FROM marks WHERE enrollment_no = ?`;
  db.query(query, [enrollment_no], (err, results) => {
    if (err) {
      console.error('Error fetching student marks:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    // Return standardized response shape: `data` must be an ARRAY
    // Even if there are no marks, return an empty array in `data` (do NOT return 404)
    return res.json({ data: results || [] });
  });
};

module.exports = { upsertMarks, getMarksByClass, getMarksForStudent };
