import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFacultyAdmin } from '../services/api';
import Card from '../components/Card';

const AdminAddFaculty = () => {
  const [faculty_id, setFacultyId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!faculty_id || !name || !password) {
      setMessage('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const result = await addFacultyAdmin({ faculty_id, name, password });
      setMessage('✓ Faculty added successfully');
      setFacultyId(''); setName(''); setPassword('');
      setTimeout(() => navigate('/admin-dashboard'), 2000);
    } catch (err) {
      console.error('Full error object:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add faculty';
      setMessage('✗ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Add Faculty Member</h1>
        <p style={{ color: '#666' }}>Create a new faculty account</p>
      </div>

      <Card style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label className="form-label">Faculty ID *</label>
            <input 
              className="form-control" 
              value={faculty_id} 
              onChange={e=>setFacultyId(e.target.value)} 
              placeholder="e.g., FAC001"
              disabled={loading}
            />
          </div>

          <div>
            <label className="form-label">Full Name *</label>
            <input 
              className="form-control" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="e.g., Dr. John Smith"
              disabled={loading}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Password *</label>
            <input 
              className="form-control" 
              type="password"
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="Set a secure password"
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
            <button className="btn primary"  style={{position:'relative',top:'0px'}}type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Faculty'}
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

export default AdminAddFaculty;
