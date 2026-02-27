import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/student/profile/${user.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Student profile not found');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setProfile(data);
      setEditEmail(data.email || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!editEmail || editEmail === profile.email) {
      setError('Please enter a different email address');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`http://localhost:5000/api/student/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: editEmail }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setProfile({ ...profile, email: editEmail });
      setSuccess('Email updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating email:', err);
      setError(err.message || 'Failed to update email');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!editPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (editPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (editPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`http://localhost:5000/api/student/password/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: editPassword }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setEditPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="page-container">
      <button
        onClick={() => navigate('/student-dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          marginBottom: '2rem',
          backgroundColor: '#e5e7eb',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: '500',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ marginBottom: '2rem', color: '#1f2937', fontSize: '2rem', fontWeight: 'bold' }}>
        My Profile
      </h1>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#666' }}>
          Loading profile...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          Error: {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          {success}
        </div>
      )}

      {!loading && profile && (
        <div style={{ display: 'grid', gap: '2rem', maxWidth: '600px' }}>
          {/* Profile Information Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ marginBottom: '1.5rem', color: '#1f2937', fontWeight: '600', fontSize: '1.25rem' }}>
              Profile Information
            </h2>

            {/* Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                Full Name
              </label>
              <input
                type="text"
                value={profile.name || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'not-allowed',
                  fontSize: '1rem',
                }}
              />
            </div>

            {/* Enrollment Number */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                Enrollment Number
              </label>
              <input
                type="text"
                value={profile.enrollment_no || user.id || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'not-allowed',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Branch */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                Branch / Department
              </label>
              <input
                type="text"
                value={profile.department || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'not-allowed',
                  fontSize: '1rem',
                }}
              />
            </div>

            {/* Semester */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                Semester
              </label>
              <input
                type="text"
                value={profile.semester || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'not-allowed',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>

          {/* Email Update Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ marginBottom: '1.5rem', color: '#1f2937', fontWeight: '600', fontSize: '1.25rem' }}>
              Update Email
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                Email Address
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <button
              onClick={handleUpdateEmail}
              disabled={updating}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: updating ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                opacity: updating ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!updating) e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              {updating ? 'Updating...' : 'Update Email'}
            </button>
          </div>

          {/* Password Update Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ marginBottom: '1.5rem', color: '#1f2937', fontWeight: '600', fontSize: '1.25rem' }}>
              Update Password
            </h2>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
              >
                Change Password
              </button>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#1f2937' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={updating}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      opacity: updating ? 0.6 : 1,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!updating) e.currentTarget.style.backgroundColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981';
                    }}
                  >
                    {updating ? 'Updating...' : 'Update Password'}
                  </button>

                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setEditPassword('');
                      setConfirmPassword('');
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#e5e7eb',
                      color: '#1f2937',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
