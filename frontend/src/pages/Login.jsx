import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api'; 
import '../styles/pages.css';

const Login = () => {
  const [role, setRole] = useState('faculty'); // 'faculty' or 'student'
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!id || !password) {
      setError('Please enter both ID and password.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting login with role:', role);
      const response = await login({ role, id, password });
      const { user } = response;
      
      if (!user) {
        setError('Invalid server response - no user data returned');
        setIsLoading(false);
        return;
      }
      
      console.log('Login response received, user:', user);

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      // IMPORTANT: Store role explicitly to avoid stale role from previous login
      localStorage.setItem('role', user.role);
      
      // Dispatch custom event to notify App component of role change (same-tab)
      window.dispatchEvent(new CustomEvent('roleChange', { detail: { role: user.role } }));
      
      console.log('=== LOGIN SUCCESSFUL ===');
      console.log('Stored user:', JSON.stringify(user));
      console.log('Stored role:', user.role);
      console.log('localStorage["role"]:', localStorage.getItem('role'));
      console.log('localStorage["user"]:', localStorage.getItem('user'));
      console.log('Dispatched roleChange event');

      // Navigate to the correct dashboard based on role
      const userRole = user.role ? String(user.role).toLowerCase().trim() : null;
      console.log('Checking user.role:', userRole, '(type:', typeof userRole, ')');
      
      let navPath = null;
      if (userRole === 'faculty') {
        navPath = '/faculty-dashboard';
        console.log('Role matched: faculty -> navigating to', navPath);
      } else if (userRole === 'student') {
        navPath = '/student-dashboard';
        console.log('Role matched: student -> navigating to', navPath);
      } else {
        console.error('Unknown role value:', user.role, 'type:', typeof user.role);
        setError('Unknown user role. Expected "faculty" or "student", got: ' + user.role);
        setIsLoading(false);
        return;
      }
      
      // Ensure localStorage is committed before navigation
      console.log('Before navigate - localStorage check:');
      console.log('  role:', localStorage.getItem('role'));
      console.log('  user:', localStorage.getItem('user'));
      
      console.log('Calling navigate() with path:', navPath);
      setIsLoading(false); // Stop loading BEFORE navigation to prevent UI flicker
      
      // Use replace: true to prevent going back to login after successful navigation
      navigate(navPath, { replace: true });
      console.log('navigate() called successfully');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      }}
    >
      {/* Login Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '0 1.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            padding: '2.5rem',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
              AcadPortal
            </h1>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#6b7280' }}>
              Sign in to your account
            </p>
          </div>

          {/* Segmented Toggle Control */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '2rem',
              backgroundColor: '#f3f4f6',
              padding: '0.4rem',
              borderRadius: '10px',
            }}
          >
            <button
              onClick={() => setRole('faculty')}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: role === 'faculty' ? '#3b82f6' : 'transparent',
                color: role === 'faculty' ? 'white' : '#6b7280',
                boxShadow: role === 'faculty' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              Faculty
            </button>
            <button
              onClick={() => setRole('student')}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: role === 'student' ? '#3b82f6' : 'transparent',
                color: role === 'student' ? 'white' : '#6b7280',
                boxShadow: role === 'student' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
              }}
            >
              Student
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* ID Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="id"
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                {role === 'faculty' ? 'Faculty ID' : 'Enrollment Number'}
              </label>
              <input
                type="text"
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={role === 'faculty' ? 'e.g., FAC001' : 'e.g., 2023CSE001'}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                }}
              >
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: 'white',
                backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Admin Link */}
          <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#6b7280' }}>
              Are you an admin?
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#2563eb';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#3b82f6';
                e.target.style.textDecoration = 'none';
              }}
            >
              Login here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;