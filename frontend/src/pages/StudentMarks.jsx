import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import API from '../services/api';
import '../styles/pages.css';

const StudentMarks = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { id: null, name: 'Student' };
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarks = async () => {
      if (!user.id) {
        setError('No student id available. Please login.');
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(`/marks/student/${user.id}`);
        // API returns { data: [...] }
        const payload = res.data;
        const marksArray = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.results)
          ? payload.results
          : [];

        const mapped = marksArray.map((r, idx) => {
          const mid1 = Number.isFinite(r.mid1_marks) ? r.mid1_marks : Number.isFinite(r.mid_term_1) ? r.mid_term_1 : null;
          const mid1Total = r.mid1_total || 30;
          const mid2 = Number.isFinite(r.mid2_marks) ? r.mid2_marks : Number.isFinite(r.mid_term_2) ? r.mid_term_2 : null;
          const mid2Total = r.mid2_total || 30;
          
          let percentage = null;
          let totalObtained = 0;
          let totalPossible = 0;
          
          if (mid1 !== null) {
            totalObtained += mid1;
            totalPossible += mid1Total;
          }
          if (mid2 !== null) {
            totalObtained += mid2;
            totalPossible += mid2Total;
          }
          
          if (totalPossible > 0) {
            percentage = Math.round((totalObtained / totalPossible) * 100);
          }

          return {
            id: r.marks_id || idx,
            subject: r.subject || 'Unknown',
            mid1_marks: mid1,
            mid1_total: mid1Total,
            mid2_marks: mid2,
            mid2_total: mid2Total,
            percentage,
          };
        });
        setMarks(mapped);
      } catch (err) {
        console.error('Failed to fetch marks:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load marks');
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [user.id]);

  const calculateGPA = () => {
    if (marks.length === 0) return 0;
    const valid = marks.filter((m) => typeof m.percentage === 'number' && m.percentage !== null);
    if (valid.length === 0) return 0;
    const avg = valid.reduce((sum, mark) => sum + mark.percentage, 0) / valid.length;
    return avg.toFixed(2);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#4CAF50'; // Green
    if (percentage >= 80) return '#2196F3'; // Blue
    if (percentage >= 70) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div className="page-container">
      <h1 className="page-title">My Marks</h1>

      {loading ? (
        <Card>
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading marks...</p>
        </Card>
      ) : error ? (
        <Card>
          <p style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</p>
        </Card>
      ) : (
        <>
          <Card className="gpa-card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#333' }}>Overall Performance</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2196F3', marginTop: '1rem' }}>
              {calculateGPA()}%
            </div>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>Average Score</p>
          </Card>

          <Card>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Mid Term 1</th>
                    <th>Mid Term 2</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
              {marks.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                        Marks not published yet
                      </td>
                    </tr>
                  ) : (
                    marks.map((mark) => (
                      <tr key={mark.id}>
                        <td><strong>{mark.subject}</strong></td>
                        <td>
                          {mark.mid1_marks !== null ? `${mark.mid1_marks}/${mark.mid1_total}` : 'Not Entered'}
                        </td>
                        <td>
                          {mark.mid2_marks !== null ? `${mark.mid2_marks}/${mark.mid2_total}` : 'Not Entered'}
                        </td>
                        <td>
                          {mark.percentage !== null ? (
                            <span
                              style={{
                                backgroundColor: getGradeColor(mark.percentage),
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                              }}
                            >
                              {`${mark.percentage}%`}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default StudentMarks;
