import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaCheckCircle, FaClock } from 'react-icons/fa';
import Card from '../components/Card';
import { getFacultyAssignments } from '../services/api';
import '../styles/pages.css';

const FacultyAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline', 'title', 'submissions'

  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError('');
        if (!user.id) {
          setError('User not logged in');
          return;
        }
        const data = await getFacultyAssignments(user.id);
        setAssignments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError(err.message || 'Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user.id]);

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/assignment-details/${assignmentId}`);
  };

  const getSortedAssignments = () => {
    const sorted = [...assignments];
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'submissions':
        return sorted.sort((a, b) => (b.submitted / b.total_students) - (a.submitted / a.total_students));
      case 'deadline':
      default:
        return sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSubmissionPercentage = (submitted, total) => {
    if (total === 0) return 0;
    return Math.round((submitted / total) * 100);
  };

  const getSubmissionStatus = (submitted, total) => {
    const percentage = getSubmissionPercentage(submitted, total);
    if (percentage === 100) {
      return { label: 'Complete', color: '#10b981', icon: <FaCheckCircle /> };
    } else if (percentage >= 75) {
      return { label: 'Most Done', color: '#f59e0b', icon: <FaClock /> };
    } else {
      return { label: 'In Progress', color: '#ef4444', icon: <FaClock /> };
    }
  };

  const sortedAssignments = getSortedAssignments();

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/faculty-dashboard')}
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
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1 style={{ marginBottom: '0.5rem' }}>All Assignments</h1>
        <p style={{ color: '#666', marginBottom: '0' }}>
          Manage and track all your assignments and student submissions
        </p>
      </div>

      {/* Sort Controls */}
      <Card style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '500', color: '#333' }}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.95rem',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="deadline">Deadline (earliest first)</option>
            <option value="submissions">Submission Rate (highest first)</option>
            <option value="title">Title (A-Z)</option>
          </select>
          <span style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9rem' }}>
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <FaSpinner style={{ animation: 'spin 1s linear infinite', fontSize: '2rem', color: '#2563eb', marginBottom: '1rem' }} />
          <p style={{ color: '#666' }}>Loading assignments...</p>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '1rem' }}>
          <p style={{ color: '#991b1b', margin: 0 }}>Error: {error}</p>
        </Card>
      )}

      {/* Assignments List */}
      {!loading && !error && assignments.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>No assignments created yet.</p>
        </Card>
      )}

      {!loading && !error && sortedAssignments.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {sortedAssignments.map((assignment) => {
            const submitted = assignment.submitted || 0;
            const total = assignment.total_students || 0;
            const percentage = getSubmissionPercentage(submitted, total);
            const status = getSubmissionStatus(submitted, total);

            return (
              <Card
                key={assignment.assignment_id}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: '4px solid #2563eb',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => handleAssignmentClick(assignment.assignment_id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1f2937' }}>
                      {assignment.title}
                    </h3>
                    <p style={{ marginTop: 0, marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                      {assignment.subject && <span>{assignment.subject} • </span>}
                      <span>Due: {formatDate(assignment.deadline)}</span>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        backgroundColor: `${status.color}20`,
                        color: status.color,
                        fontWeight: '500',
                        fontSize: '0.85rem',
                      }}
                    >
                      {status.icon}
                      {status.label}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Submissions</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>
                      {submitted} / {total} ({percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, #2563eb, #3b82f6)`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FacultyAssignments;
