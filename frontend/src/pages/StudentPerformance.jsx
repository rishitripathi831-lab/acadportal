import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import API from '../services/api';

const StudentPerformance = () => {
  const { enrollment_no } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/student/performance/${enrollment_no}/${user.id}`);
        setPerf(res.data);
      } catch (err) {
        console.error('Failed to fetch performance:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user.id) fetch();
  }, [enrollment_no, user.id]);

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (!perf) return <div className="page-container"><p>Failed to load.</p></div>;

  const submitRate = perf.totalAssignments > 0 ? Math.round((perf.submittedAssignments / perf.totalAssignments) * 100) : 0;
  const totalMarks = (perf.marks || []).reduce((sum, m) => sum + (m.mid1 || 0) + (m.mid2 || 0), 0);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Student Performance</h1>
          <p style={{ color: '#666' }}>Enrollment: {enrollment_no}</p>
        </div>
        <button className="btn" onClick={() => navigate(-1)} style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}>Back</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Card>
          <h3>Assignment Submission</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{submitRate}%</div>
          <div style={{ color: '#666' }}>{perf.submittedAssignments} / {perf.totalAssignments} submitted</div>
        </Card>

        <Card>
          <h3>Total Marks</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>{totalMarks}</div>
          <div style={{ color: '#666' }}>From {perf.marks.length} subjects</div>
        </Card>
      </div>


      <div style={{ marginTop: 12 }}>
        <h3>Marks</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {perf.marks.length === 0 && <div style={{ color: '#666' }}>No marks available.</div>}
          {perf.marks.map((m, idx) => (
            <Card key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.subject}</div>
                  <div style={{ color: '#666' }}>Mid1: {m.mid1 ?? '-'} | Mid2: {m.mid2 ?? '-'}</div>
                </div>
                <div style={{ fontWeight: 700 }}>{( (m.mid1||0) + (m.mid2||0) )}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;

