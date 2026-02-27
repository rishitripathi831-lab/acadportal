import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addStudentAdmin } from '../services/api';
import Card from '../components/Card';

const branches = ['CSE','CE','ME','EE','ECE'];

const AdminAddStudent = () => {
  const [enrollment_no, setEnrollment_no] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(1);
  const [password, setPassword] = useState('password');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!enrollment_no || !name || !branch || !semester) {
      setMessage('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const result = await addStudentAdmin({ enrollment_no, name, department: branch, semester, password });
      setMessage('✓ Student added successfully');
      setEnrollment_no(''); setName('');
      setTimeout(() => navigate('/admin-dashboard'), 2000);
    } catch (err) {
      console.error('Full error object:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add student';
      setMessage('✗ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Add Student</h1>
        <p style={{ color: '#666' }}>Register a new student and assign to class</p>
      </div>

      <Card style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label className="form-label">Enrollment Number *</label>
            <input 
              className="form-control" 
              value={enrollment_no} 
              onChange={e=>setEnrollment_no(e.target.value)} 
              placeholder="e.g., 2023CSE001"
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label">Full Name *</label>
            <input 
              className="form-control" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="e.g., Amit Kumar"
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label">Branch *</label>
            <select className="form-control" value={branch} onChange={e=>setBranch(e.target.value)} disabled={loading}>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Semester *</label>
            <select className="form-control" value={semester} onChange={e=>setSemester(parseInt(e.target.value))} disabled={loading}>
              {[1,2,3,4,5,6,7,8].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Password</label>
            <input 
              className="form-control" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="Default: password"
              disabled={loading}
            />
          </div>

          {message && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '0.75rem',
              borderRadius: '6px',
              backgroundColor: message.includes('✓') ? '#ecfdf5' : '#fee2e2',
              color: message.includes('✓') ? '#047857' : '#991b1b',
              fontSize: '0.9rem'
            }}>
              {message}
            </div>
          )}

          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button className="btn primary" style={{position:'relative',top:'0px'}} type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Student'}
            </button>
            <button 
              className="btn" 
              type="button" 
              onClick={() => navigate('/admin-dashboard')}
              style={{ backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminAddStudent;
