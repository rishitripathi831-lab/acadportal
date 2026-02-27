import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { getStudentsByClass } from '../services/api';

const branches = ['CSE','CE','ME','EE','ECE'];

const FacultyStudentView = () => {
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(3);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetch = async () => {
    setMessage('');
    try {
      const res = await getStudentsByClass(branch, semester);
      setStudents(res.data || res || []);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch students');
    }
  };

  return (
    <div className="page-container">
      <h1>My Students</h1>
      <p style={{ color: '#666' }}>Select class to view students (read-only).</p>

      <Card>
        <div className="form-grid">
          <div>
            <label className="form-label">Branch</label>
            <select className="form-control" value={branch} onChange={e=>setBranch(e.target.value)}>
              {branches.map(b=> <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Semester</label>
            <select className="form-control" value={semester} onChange={e=>setSemester(parseInt(e.target.value))}>
              {[1,2,3,4,5,6,7,8].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ alignSelf: 'end' }}>
            <button className="btn primary" onClick={fetch}>View Class</button>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 12 }}>
        {students.length === 0 && <div style={{ color: '#666' }}>No students loaded. Select class and click "View Class".</div>}
        {students.map(s => (
          <Card key={s.enrollment_no}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name || s.enrollment_no}</div>
                <div style={{ color: '#666' }}>{s.enrollment_no} — {s.department} — Sem {s.semester}</div>
              </div>
              <div>
                <button className="btn outline-primary" onClick={() => navigate(`/faculty/student-performance/${s.enrollment_no}`)}>View Performance</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {message && <div style={{ marginTop: 10 }}>{message}</div>}
    </div>
  );
};

export default FacultyStudentView;

