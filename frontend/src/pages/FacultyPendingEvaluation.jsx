import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { markSubmissionChecked } from '../services/api';
import '../styles/pages.css';

const FacultyPendingEvaluation = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get faculty ID from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const facultyId = user.id;

      if (!facultyId) {
        setError('Faculty ID not found');
        setLoading(false);
        return;
      }

      // Fetch pending submissions from API
      const response = await fetch(`http://localhost:5000/api/submission/pending/${facultyId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSubmissions(Array.isArray(data) ? data : []);
      console.log('Fetched pending submissions:', data);
    } catch (err) {
      console.error('Error fetching pending submissions:', err);
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsChecked = async (submissionId) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('User not logged in');
      return;
    }

    const user = JSON.parse(userStr);
    const facultyId = user.id;

    setProcessingId(submissionId);

    try {
      const response = await markSubmissionChecked(submissionId, facultyId);
      
      // Update local state
      setSubmissions(submissions.map(sub =>
        sub.submission_id === submissionId
          ? { ...sub, status: 'Checked' }
          : sub
      ));

      console.log('Submission marked as checked:', response);
    } catch (err) {
      console.error('Error marking submission as checked:', err);
      setError(err.message || 'Failed to mark submission as checked');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page-container">
      {/* Back Button */}
      <button
        onClick={() => navigate('/faculty-dashboard')}
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
        ← Back
      </button>

      <h1 style={{ marginBottom: '2rem', color: '#1f2937', fontSize: '2rem', fontWeight: 'bold' }}>
        Pending Evaluations
      </h1>

      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            fontSize: '1.1rem',
            color: '#666',
          }}
        >
          Loading submissions...
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

      {!loading && submissions.length === 0 && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            color: '#666',
          }}
        >
          <p style={{ fontSize: '1.1rem', margin: '0' }}>No pending evaluations</p>
          <p style={{ fontSize: '0.95rem', margin: '0.5rem 0 0 0', color: '#999' }}>
            All submissions have been evaluated
          </p>
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Student Name
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Enrollment No.
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Assignment Title
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Submission Date
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr
                  key={submission.submission_id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb')}
                >
                  <td style={{ padding: '1rem', color: '#374151' }}>{submission.student_name}</td>
                  <td style={{ padding: '1rem', color: '#374151', fontFamily: 'monospace' }}>
                    {submission.enrollment_no}
                  </td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{submission.assignment_title}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>
                    {new Date(submission.submission_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {submission.status === 'Pending' ? (
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '0.25rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                        }}
                      >
                        Pending
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          borderRadius: '0.25rem',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                        }}
                      >
                        Completed
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {submission.file_path && (
                        <button
                          onClick={() => window.open(`http://localhost:5000/${submission.file_path}`, '_blank')}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
                        >
                          View File
                        </button>
                      )}
                      {submission.status === 'Pending' ? (
                        <button
                          onClick={() => handleMarkAsChecked(submission.submission_id)}
                          disabled={processingId === submission.submission_id}
                          style={{
                            padding: '0.4rem 0.8rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: processingId === submission.submission_id ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            opacity: processingId === submission.submission_id ? 0.6 : 1,
                          }}
                          onMouseEnter={(e) => !processingId && (e.currentTarget.style.backgroundColor = '#2563eb')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                        >
                          {processingId === submission.submission_id ? 'Processing...' : 'Evaluate'}
                        </button>
                      ) : (
                        <span style={{ color: '#666', fontSize: '0.85rem' }}>Evaluated</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyPendingEvaluation;
