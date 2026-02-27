import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

const StudentPendingAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/student/assignments/${user.id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      // Backend now returns assignments ONLY for student's branch & semester
      // Filter to only show assignments without submissions (pending)
      const pendingAssignments = Array.isArray(data) ? data.filter(a => !a.submission_id) : [];
      setAssignments(pendingAssignments);

      // Fetch submissions for this student to display status
      const submissionsResponse = await fetch(`http://localhost:5000/api/submission/student/${user.id}`);
      if (submissionsResponse.ok) {
        const subData = await submissionsResponse.json();
        const submissionsMap = {};
        subData.forEach((sub) => {
          submissionsMap[sub.assignment_id] = sub;
        });
        setSubmissions(submissionsMap);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to fetch assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (assignmentId, file) => {
    setSelectedFiles({
      ...selectedFiles,
      [assignmentId]: file,
    });
  };

  const handleSubmit = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('assignment_id', assignmentId);
    formData.append('enrollment_no', user.id);
    formData.append('assignment_file', file);

    try {
      setUploadingId(assignmentId);
      const response = await fetch('http://localhost:5000/api/submission/submit', {
        method: 'POST',
        body: formData,
      });

      // CRITICAL: Handle 403 (deadline passed) response
      if (response.status === 403) {
        const errorData = await response.json();
        alert('❌ ' + (errorData.message || 'Assignment deadline has passed'));
        setUploadingId(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      alert('Assignment submitted successfully!');

      // Clear the selected file
      setSelectedFiles({
        ...selectedFiles,
        [assignmentId]: null,
      });

      // Refresh submissions
      await fetchAssignments();
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert(`Failed to submit assignment: ${err.message}`);
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusBadge = (assignmentId) => {
    const submission = submissions[assignmentId];

    if (!submission) {
      return (
        <span
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            borderRadius: '0.375rem',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}
        >
          Pending
        </span>
      );
    }

    if (submission.status === 'Rejected') {
      return (
        <span
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.375rem',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}
        >
          Rejected
        </span>
      );
    }

    return (
      <span
        style={{
          padding: '0.4rem 0.8rem',
          backgroundColor: '#d1fae5',
          color: '#065f46',
          borderRadius: '0.375rem',
          fontSize: '0.85rem',
          fontWeight: '500',
        }}
      >
        Submitted
      </span>
    );
  };

  const getActionButton = (assignment) => {
    const submission = submissions[assignment.assignment_id];
    const isDeadlinePassed = assignment.deadline_over;

    // Rule 1: If already submitted, show badge only (no submit/resubmit)
    if (submission && submission.status === 'Submitted') {
      return (
        <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '500' }}>
          ✓ Assignment Submitted
        </span>
      );
    }

    // Rule 2: If already approved, show badge only (no resubmit)
    if (submission && submission.status === 'Approved') {
      return (
        <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '500' }}>
          ✓ Assignment Approved
        </span>
      );
    }

    // Rule 3: If deadline passed, show red message (no submit regardless of status)
    if (isDeadlinePassed) {
      return (
        <span style={{ color: '#b91c1c', fontSize: '0.95rem', fontWeight: '600' }}>
          Assignment date is over
        </span>
      );
    }

    // Rule 4: No submissions yet and deadline NOT passed, show submit button (even if previously rejected)
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="file"
          id={`file-${assignment.assignment_id}`}
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={(e) => handleFileSelect(assignment.assignment_id, e.target.files[0])}
          style={{ display: 'none' }}
        />
        <label
          htmlFor={`file-${assignment.assignment_id}`}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            border: '1px solid #3b82f6',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.borderColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
        >
          Choose File
        </label>
        {selectedFiles[assignment.assignment_id] && (
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {selectedFiles[assignment.assignment_id].name}
          </span>
        )}
        <button
          onClick={() => handleSubmit(assignment.assignment_id)}
          disabled={uploadingId === assignment.assignment_id || !selectedFiles[assignment.assignment_id]}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: uploadingId === assignment.assignment_id ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            opacity: uploadingId === assignment.assignment_id || !selectedFiles[assignment.assignment_id] ? 0.6 : 1,
            transition: 'all 0.2s',
            transform:'scale(1.25)',
            marginLeft:'5px',
            position:'relative',
            top:'-3px',
          }}
          onMouseEnter={(e) => {
            if (uploadingId !== assignment.assignment_id && selectedFiles[assignment.assignment_id]) {
              e.currentTarget.style.backgroundColor = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
          }}
          >
            {uploadingId === assignment.assignment_id ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      );
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
        Pending Assignments
      </h1>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.1rem', color: '#666' }}>
          Loading assignments...
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

      {!loading && assignments.length === 0 && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            color: '#666',
          }}
        >
          <p style={{ fontSize: '1.1rem', margin: '0' }}>No assignments available</p>
        </div>
      )}

      {!loading && assignments.length > 0 && (
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
                  Assignment Title
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Subject
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Faculty
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Deadline
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment, index) => (
                <tr
                  key={assignment.assignment_id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  }}
                >
                  <td style={{ padding: '1rem', color: '#374151' }}>{assignment.title}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{assignment.subject || '—'}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{assignment.faculty_name || '—'}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>
                    {new Date(assignment.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(assignment.assignment_id)}</td>
                  <td style={{ padding: '1rem' }}>{getActionButton(assignment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentPendingAssignments;
