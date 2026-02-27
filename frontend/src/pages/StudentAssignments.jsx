import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import API, { submitAssignment } from '../services/api';
import '../styles/pages.css';

const StudentAssignments = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { id: null, name: 'Student' };
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user.id) {
        setError('No student id available. Please login.');
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(`/student/${user.id}/assignments`);
        // Map DB fields to UI-friendly shape
        const mapped = res.data.map((r) => ({
          id: r.assignment_id,
          title: r.title,
          course: r.subject || r.course,
          dueDate: r.deadline,
          status: r.submission_id ? 'submitted' : 'pending',
          submissionDate: r.submission_date,
          grade: r.grade,
        }));
        setAssignments(mapped);
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user.id]);

  const getStatusColor = (status) => {
    if (status === 'submitted') return 'green';
    if (status === 'pending') return 'orange';
    return 'red';
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedFile(null);
    setSubmitMessage('');
    setShowSubmitModal(true);
  };

  const closeSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedAssignment(null);
    setSelectedFile(null);
    setSubmitMessage('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      
      const allowedExts = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(file.type) || !allowedExts.includes(ext)) {
        setSubmitMessage('Invalid file type. Please upload PDF, DOC, DOCX, PPT, or PPTX only.');
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        setSubmitMessage('File size exceeds 50MB limit.');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setSubmitMessage('');
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile || !selectedAssignment) {
      setSubmitMessage('Please select a file first.');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new FormData();
      formData.append('assignment_id', selectedAssignment.id);
      formData.append('enrollment_no', user.id);
      formData.append('assignment_file', selectedFile);

      const response = await submitAssignment(formData);
      setSubmitMessage(`✓ ${response.message}`);
      
      // Update assignment status in list
      setAssignments(assignments.map(a => 
        a.id === selectedAssignment.id 
          ? { ...a, status: 'submitted', submissionDate: new Date().toISOString() }
          : a
      ));

      setTimeout(() => {
        closeSubmitModal();
      }, 1500);
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setSubmitMessage(`Error: ${err.response?.data?.message || err.message || 'Failed to submit'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">My Assignments</h1>

      {loading ? (
        <Card>
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading assignments...</p>
        </Card>
      ) : error ? (
        <Card>
          <p style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</p>
        </Card>
      ) : (
        <div className="assignments-container">
          {assignments.length === 0 ? (
            <Card>
              <p style={{ textAlign: 'center', padding: '2rem' }}>No assignments yet.</p>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="assignment-card">
                <div className="assignment-header">
                  <h3>{assignment.title}</h3>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(assignment.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    {assignment.status}
                  </span>
                </div>
                <p className="assignment-course">
                  <strong>Course:</strong> {assignment.course}
                </p>
                <p className="assignment-due">
                  <strong>Due:</strong> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'TBD'}
                </p>
                {assignment.submissionDate && (
                  <p className="assignment-submitted">
                    <strong>Submitted:</strong> {new Date(assignment.submissionDate).toLocaleDateString()}
                  </p>
                )}
                {!( ['submitted','approved'].includes((assignment.status || '').toLowerCase())) && (
                  <button 
                    className="btn primary" 
                    style={{ marginTop: '1rem' }}
                    onClick={() => openSubmitModal(assignment)}
                  >
                    Submit Assignment
                  </button>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Submission Modal */}
      {showSubmitModal && selectedAssignment && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeSubmitModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: '0', marginBottom: '1rem', color: '#1f2937' }}>
              Submit Assignment
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              <strong>{selectedAssignment.title}</strong>
            </p>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ color: '#374151', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
                Upload File (PDF, DOC, DOCX, PPT, PPTX)
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                disabled={submitting}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              />
            </label>

            {selectedFile && (
              <p style={{ color: '#059669', marginBottom: '1rem', fontSize: '0.95rem' }}>
                ✓ Selected: {selectedFile.name}
              </p>
            )}

            {submitMessage && (
              <p
                style={{
                  padding: '0.75rem',
                  backgroundColor: submitMessage.includes('Error') ? '#fee2e2' : '#dcfce7',
                  color: submitMessage.includes('Error') ? '#991b1b' : '#166534',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                {submitMessage}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={closeSubmitModal}
                disabled={submitting}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={!selectedFile || submitting}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: selectedFile && !submitting ? '#3b82f6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: selectedFile && !submitting ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
