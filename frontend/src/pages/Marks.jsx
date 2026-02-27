import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { getMarksByClass, upsertMarks } from '../services/api';

const branches = ['CSE','CE','ME','EE','ECE'];

const Marks = () => {
  const [subject, setSubject] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(3);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedMarks, setExpandedMarks] = useState({ examType: 'mid1', marks: '' });
  const [saving, setSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetch = async () => {
    const subjectTrimmed = subject.trim();
    if (!subjectTrimmed) {
      setMessage('Please enter a subject name');
      return;
    }

    try {
      const res = await getMarksByClass(branch, semester, subjectTrimmed);
      console.log('Marks fetch response:', res);
      setStudents(Array.isArray(res) ? res : []);
      setMessage('');
    } catch (err) {
      console.error('Error fetching marks:', err);
      setMessage('Failed to fetch marks');
    }
  };

  useEffect(() => {
    // Reset students list when branch/semester change
    setStudents([]);
  }, [branch, semester]);

  const handleExpandRow = (student) => {
    if (expandedId === student.enrollment_no) {
      setExpandedId(null);
      return;
    }
    setExpandedId(student.enrollment_no);
    // Default to mid1, start with empty marks field
    setExpandedMarks({
      examType: 'mid1',
      obtainedMarks: '',
      totalMarks: 30
    });
  };

  const handleSaveMarks = async (enrollment_no) => {
    // Validate obtained marks
    if (!expandedMarks.obtainedMarks || expandedMarks.obtainedMarks === '') {
      setMessage('Please enter obtained marks');
      return;
    }
    
    const obtained = parseFloat(expandedMarks.obtainedMarks);
    const total = parseFloat(expandedMarks.totalMarks) || 30;
    
    if (isNaN(obtained) || obtained < 0) {
      setMessage('Obtained marks must be a non-negative number');
      return;
    }
    if (isNaN(total) || total <= 0) {
      setMessage('Total marks must be a positive number');
      return;
    }
    if (obtained > total) {
      setMessage('Obtained marks cannot exceed total marks');
      return;
    }

    setSaving(true);
    try {
      const subjectTrimmed = subject.trim();
      if (!subjectTrimmed) {
        setMessage('Subject is required');
        setSaving(false);
        return;
      }

      // Send the selected exam type with obtained and total marks
      const payload = {
        enrollment_no,
        subject: subjectTrimmed,
        exam_type: expandedMarks.examType, // 'mid1' or 'mid2'
        obtained_marks: Math.round(obtained),
        total_marks: Math.round(total)
      };

      console.log('=== MARKS SAVE START ===');
      console.log('Payload:', payload);
      
      // Call API to save marks
      const response = await upsertMarks(payload);
      console.log('Save API response:', response);
      
      // Wait a bit for DB to sync, then refetch
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const fetchedData = await getMarksByClass(branch, semester, subjectTrimmed);
        setStudents(Array.isArray(fetchedData) ? [...fetchedData] : []);
        setRefreshTrigger(prev => prev + 1);
      } catch (fetchErr) {
        console.error('Error during refetch:', fetchErr);
        setMessage('Marks saved but failed to refresh. Please refresh the page.');
        setSaving(false);
        return;
      }
      
      setMessage(`✓ ${expandedMarks.examType === 'mid1' ? 'Mid Term 1' : 'Mid Term 2'} marks for "${subjectTrimmed}" saved successfully`);
      setExpandedId(null);
      setExpandedMarks({ examType: 'mid1', obtainedMarks: '', totalMarks: 30 });
    } catch (err) {
      console.error('Error saving marks:', err);
      setMessage(`Failed to save marks: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const isMarksComplete = (student) => {
    return (student.mid1_marks != null || student.mid_term_1 != null) && 
           (student.mid2_marks != null || student.mid_term_2 != null);
  };

  const marksIncomplete = (student) => {
    return (student.mid1_marks == null && student.mid_term_1 == null) || 
           (student.mid2_marks == null && student.mid_term_2 == null);
  };

  // Helper to display marks as "X / Y" or "Not Entered"
  const renderMarks = (student, examType) => {
    const marksField = examType === 'mid1' ? 'mid1_marks' : 'mid2_marks';
    const totalField = examType === 'mid1' ? 'mid1_total' : 'mid2_total';
    const legacyField = examType === 'mid1' ? 'mid_term_1' : 'mid_term_2';
    
    const marks = student[marksField];
    const total = student[totalField];
    const legacyMarks = student[legacyField];
    
    // Log what we're seeing for debugging
    if (marks !== null && marks !== undefined) {
      console.log(`✓ renderMarks ${student.enrollment_no} ${examType}: ${marks}/${total}`);
    }
    
    // New format: check if marks exist (including 0)
    if (marks !== null && marks !== undefined) {
      const totalVal = total || 30;
      return (
        <span style={{ 
          fontWeight: 600, 
          color: '#fff', 
          backgroundColor: '#059669', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '4px', 
          fontSize: '0.9rem',
          display: 'inline-block'
        }}>
          {marks} / {totalVal}
        </span>
      );
    }
    
    // Legacy format fallback
    if (legacyMarks !== null && legacyMarks !== undefined) {
      return (
        <span style={{ fontWeight: 600, color: '#2563eb' }}>
          {legacyMarks}
        </span>
      );
    }
    
    // No marks entered
    return (
      <span style={{ 
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#fef3c7',
        color: '#92400e',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: 500
      }}>
        Not Entered
      </span>
    );
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Marks Entry</h1>
        <p style={{ color: '#666' }}>Manage Mid Term marks for students by subject</p>
      </div>

      <Card>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'end', gap: '1rem' }}>
          <div>
            <label className="form-label">Subject Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input 
              type="text"
              className="form-control"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., DBMS, OS, CN, SE"
              disabled={students.length > 0}
              style={{ 
                backgroundColor: students.length > 0 ? '#f3f4f6' : 'white'
              }}
            />
            {students.length > 0 && (
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                Change subject to view different class
              </p>
            )}
          </div>

          <div>
            <label className="form-label">Branch</label>
            <select 
              className="form-control" 
              value={branch} 
              onChange={e=>setBranch(e.target.value)}
              disabled={students.length > 0}
              style={{ backgroundColor: students.length > 0 ? '#f3f4f6' : 'white' }}
            >
              {branches.map(b=> <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Semester</label>
            <select 
              className="form-control" 
              value={semester} 
              onChange={e=>setSemester(parseInt(e.target.value))}
              disabled={students.length > 0}
              style={{ backgroundColor: students.length > 0 ? '#f3f4f6' : 'white' }}
            >
              {[1,2,3,4,5,6,7,8].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button 
            className="btn primary" 
            onClick={fetch} 
            style={{ marginBottom: 0 }}
            disabled={!subject.trim()}
          >
            Fetch Class
          </button>
        </div>
      </Card>

      {message && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: message.includes('✓') ? '#ecfdf5' : '#fee2e2',
          color: message.includes('✓') ? '#047857' : '#991b1b',
          borderRadius: '6px',
          fontSize: '0.95rem'
        }}>
          {message}
        </div>
      )}

      <div className="table-container" style={{ marginTop: '1.5rem' }}>
        {students.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            No students found. Select branch and semester, then click "Fetch Class".
          </div>
        ) : (
          <table className="data-table" key={refreshTrigger}>
            <thead>
              <tr>
                <th>Enrollment No.</th>
                <th>Student Name</th>
                <th>Mid Term 1</th>
                <th>Mid Term 2</th>
                <th style={{ width: '140px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <React.Fragment key={student.enrollment_no}>
                  <tr style={{
                    backgroundColor: expandedId === student.enrollment_no ? '#f0f7ff' : 'transparent'
                  }}>
                    <td style={{ fontWeight: 500 }}>{student.enrollment_no}</td>
                    <td>{student.name || '—'}</td>
                    <td>{renderMarks(student, 'mid1')}</td>
                    <td>{renderMarks(student, 'mid2')}</td>
                    <td>
                      {marksIncomplete(student) ? (
                        <button 
                          className="btn small"
                          onClick={() => handleExpandRow(student)}
                          style={{
                            backgroundColor: expandedId === student.enrollment_no ? '#2563eb' : '#f3f4f6',
                            color: expandedId === student.enrollment_no ? '#fff' : '#666',
                            border: expandedId === student.enrollment_no ? 'none' : '1px solid #d1d5db'
                          }}
                        >
                          {expandedId === student.enrollment_no ? 'Close' : 'Enter Marks'}
                        </button>
                      ) : (
                        <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 500 }}>✓ Submitted</span>
                      )}
                    </td>
                  </tr>

                  {expandedId === student.enrollment_no && marksIncomplete(student) && (
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <td colSpan="5">
                        <div style={{
                          padding: '1rem 0',
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'flex-end',
                          borderTop: '1px solid #e5e7eb',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <div style={{ flex: 1, maxWidth: '150px' }}>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
                              Exam Type
                            </label>
                            <select 
                              className="form-control"
                              value={expandedMarks.examType}
                              onChange={e => setExpandedMarks({...expandedMarks, examType: e.target.value})}
                              disabled={saving}
                            >
                              <option value="mid1">Mid Term 1</option>
                              <option value="mid2">Mid Term 2</option>
                            </select>
                          </div>
                          
                          <div style={{ flex: 1, maxWidth: '150px' }}>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
                              Obtained Marks
                            </label>
                            <input 
                              type="number" 
                              className="form-control"
                              value={expandedMarks.obtainedMarks} 
                              onChange={e => setExpandedMarks({...expandedMarks, obtainedMarks: e.target.value})}
                              placeholder="0"
                              min="0"
                              disabled={saving}
                            />
                          </div>

                          <div style={{ flex: 1, maxWidth: '150px' }}>
                            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
                              Total Marks
                            </label>
                            <input 
                              type="number" 
                              className="form-control"
                              value={expandedMarks.totalMarks} 
                              onChange={e => setExpandedMarks({...expandedMarks, totalMarks: e.target.value})}
                              placeholder="30"
                              min="1"
                              disabled={saving}
                            />
                          </div>
                          
                          <button 
                            className="btn primary"
                            onClick={() => handleSaveMarks(student.enrollment_no)}
                            disabled={saving}
                            style={{ marginBottom: 0 }}
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Marks;
