import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaClock, FaTimes } from 'react-icons/fa';
import Card from '../components/Card';
import { getAssignmentDetails, getSubmissionStats, getSubmissionList } from '../services/api';
import '../styles/pages.css';

// Simple pie chart implementation using Canvas
const PieChart = ({ submitted, pending, canvasId }) => {
  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const total = submitted + pending;
    if (total === 0) return;

    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw submitted slice
    const submittedAngle = (submitted / total) * 2 * Math.PI;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + submittedAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Draw pending slice
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2 + submittedAngle, -Math.PI / 2 + 2 * Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }, [submitted, pending, canvasId]);

  return <canvas id={canvasId} width="200" height="200" style={{ maxWidth: '100%' }} />;
};

const FacultyAssignmentDetails = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'status', 'grade'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [assignmentData, statsData, submissionsData] = await Promise.all([
          getAssignmentDetails(assignmentId),
          getSubmissionStats(assignmentId),
          getSubmissionList(assignmentId),
        ]);

        setAssignment(assignmentData);
        setStats(statsData);
        setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      } catch (err) {
        console.error('Error fetching assignment data:', err);
        setError(err.message || 'Failed to load assignment details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSortedSubmissions = () => {
    const sorted = [...submissions];
    switch (sortBy) {
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case 'grade':
        return sorted.sort((a, b) => (b.grade || 0) - (a.grade || 0));
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Submitted') {
      return (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}
        >
          <FaCheckCircle /> Submitted
        </div>
      );
    } else {
      return (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            fontSize: '0.85rem',
            fontWeight: '500',
          }}
        >
          <FaTimes /> Pending
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', color: '#2563eb', marginBottom: '1rem' }} />
          <p style={{ color: '#666' }}>Loading assignment details...</p>
        </Card>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="page-container">
        <button
          onClick={() => navigate('/faculty-assignments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            marginBottom: '1rem',
          }}
        >
          <FaArrowLeft /> Back
        </button>
        <Card style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem' }}>
          <p style={{ color: '#991b1b', margin: 0 }}>Error: {error || 'Assignment not found'}</p>
        </Card>
      </div>
    );
  }

  const sortedSubmissions = getSortedSubmissions();
  const submitted = stats?.submitted || 0;
  const pending = stats?.pending || 0;

  return (
    <div className="page-container">
      {/* Back Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/faculty-assignments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#2563eb',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          <FaArrowLeft /> Back to All Assignments
        </button>
      </div>

      {/* Assignment Header */}
      <Card style={{ marginBottom: '2rem', borderLeft: '4px solid #2563eb' }}>
        <h1 style={{ marginTop: 0, marginBottom: '1rem' }}>{assignment.title}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.9rem' }}>Subject</p>
            <p style={{ margin: '0', fontWeight: '600', color: '#1f2937' }}>{assignment.subject || 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.9rem' }}>Deadline</p>
            <p style={{ margin: '0', fontWeight: '600', color: '#1f2937' }}>{formatDate(assignment.deadline)}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', color: '#666', fontSize: '0.9rem' }}>Faculty</p>
            <p style={{ margin: '0', fontWeight: '600', color: '#1f2937' }}>{assignment.faculty_name || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Submission Summary & Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Stats Cards */}
        <Card>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.95rem' }}>Total Submissions</p>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem' }}>
              {submitted}
            </div>
            <p style={{ margin: '0', color: '#999', fontSize: '0.9rem' }}>out of {stats?.total_students || 0} students</p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.95rem' }}>Pending Submissions</p>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>
              {pending}
            </div>
            <p style={{ margin: '0', color: '#999', fontSize: '0.9rem' }}>
              {pending > 0 ? 'Awaiting submission' : 'All submitted!'}
            </p>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.95rem', fontWeight: '500' }}>Submission Status</p>
          <PieChart submitted={submitted} pending={pending} canvasId={`pie-${assignmentId}`} />
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
              <span>Submitted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
              <span>Pending</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Student Submissions Table */}
      <Card>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Student Submissions</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.9rem',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="grade">Sort by Grade</option>
            </select>
          </div>
        </div>

        {submissions.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem 0' }}>No students found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.95rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Student Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Roll No</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Submission Date</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.map((submission, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      '&:hover': { backgroundColor: '#f9fafb' },
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem', color: '#1f2937', fontWeight: '500' }}>{submission.name}</td>
                    <td style={{ padding: '1rem', color: '#666' }}>{submission.enrollment_no}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{getStatusBadge(submission.status)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                      {submission.status === 'Submitted' ? formatDate(submission.submission_date) : '—'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>
                      {submission.status === 'Submitted' ? submission.grade || '—' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FacultyAssignmentDetails;
