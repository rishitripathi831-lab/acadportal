import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [id, setId] = useState('admin');
  const [password, setPassword] = useState('admin@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Frontend-only hardcoded admin authentication
    if (id === 'admin' && password === 'admin@123') {
      const user = { id: 'admin', name: 'Administrator', role: 'admin' };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', 'admin');
      
      
      window.dispatchEvent(new CustomEvent('roleChange', { detail: { role: 'admin' } }));
      console.log('Admin login successful, dispatched roleChange event');
      
      navigate('/admin-dashboard');
    } else {
      setError('Invalid admin credentials');
    }
    setIsLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '1rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937', marginTop: 0, marginBottom: '0.5rem', textAlign: 'center' }}>Admin Portal</h1>
          <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem' }}>System Administrator Login</p>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Admin ID</label>
              <input 
                className="form-control"
                value={id} 
                onChange={e => setId(e.target.value)} 
                placeholder="Enter admin ID"
                disabled={isLoading}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>Password</label>
              <input 
                className="form-control"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <button 
              className="btn primary" 
              type="submit" 
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Logging In...' : 'Login as Admin'}
            </button>
          </form>

          <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb' }} />

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>Not an admin?</p>
            <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Back to User Login</Link>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
