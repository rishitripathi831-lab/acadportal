import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Student' };
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loadingDeadlines, setLoadingDeadlines] = useState(true);

  useEffect(() => {
    // Fetch pending assignments count and upcoming deadlines
    fetchAssignmentCount();
    fetchUpcomingDeadlines();
  }, []);

  const fetchAssignmentCount = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/assignments/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Backend now filters by branch & semester; count those WITHOUT submissions
        const pendingCount = Array.isArray(data) ? data.filter(a => !a.submission_id).length : 0;
        setAssignmentCount(pendingCount);
      }
    } catch (err) {
      console.error('Error fetching assignment count:', err);
    } finally {
      setLoadingCount(false);
    }
  };

  const fetchUpcomingDeadlines = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/upcoming-deadlines/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUpcomingDeadlines(data);
      }
    } catch (err) {
      console.error('Error fetching upcoming deadlines:', err);
    } finally {
      setLoadingDeadlines(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTimeRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) return 'Overdue';
    if (daysRemaining === 0) return 'Today';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  };

  const handleDeadlineClick = (assignmentId) => {
    navigate('/student/pending-assignments', { state: { scrollToAssignment: assignmentId } });
  };

  const dashboardCards = [
    {
      id: 'profile',
      title: 'My Profile',
      icon: '👤',
      color: '#3b82f6',
      lightColor: '#eff6ff',
      path: '/student/profile',
      description: 'View and edit your profile information',
      buttonText: 'View / Edit',
      count: null,
    },
    {
      id: 'assignments',
      title: 'Pending Assignments',
      icon: '📝',
      color: '#f59e0b',
      lightColor: '#fffbeb',
      path: '/student/pending-assignments',
      description: 'View and submit pending assignments',
      buttonText: 'View Assignments',
      count: assignmentCount,
    },
    {
      id: 'performance',
      title: 'Recent Performance',
      icon: '📊',
      color: '#10b981',
      lightColor: '#f0fdf4',
      path: '/student/marks-analytics',
      description: 'View your marks and analytics',
      buttonText: 'View Analytics',
      count: null,
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937', fontSize: '2rem', fontWeight: 'bold' }}>
        Welcome, {user.name}!
      </h1>

      {/* Dashboard Cards Grid - 3 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {dashboardCards.map((card) => (
          <div
            key={card.id}
            style={{
              backgroundColor: card.lightColor,
              borderRadius: '12px',
              padding: '1.5rem',
              border: `2px solid ${card.color}20`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 8px 16px ${card.color}30`;
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = card.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = `${card.color}20`;
            }}
          >
            {/* Icon and Title Section */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${card.color}15`,
                  borderRadius: '10px',
                }}
              >
                {card.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem', color: '#1f2937', margin: 0 }}>
                  {card.title}
                </h3>
                {card.count !== null && (
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: card.color,
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    {loadingCount && card.id === 'assignments' ? '...' : card.count}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
              {card.description}
            </p>

            {/* Action Button */}
            <button
              onClick={() => navigate(card.path)}
              style={{
                backgroundColor: card.color,
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Upcoming Deadlines Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          marginTop: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
          📅 Upcoming Deadlines
        </h2>

        {loadingDeadlines ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            Loading deadlines...
          </div>
        ) : upcomingDeadlines.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', fontSize: '1rem' }}>
            No upcoming deadlines 🎉
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#1f2937' }}>
                    Subject
                  </th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#1f2937' }}>
                    Assignment
                  </th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#1f2937' }}>
                    Due Date
                  </th>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#1f2937' }}>
                    Time Remaining
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingDeadlines.map((deadline, index) => (
                  <tr
                    key={deadline.assignment_id}
                    style={{
                      borderBottom: index !== upcomingDeadlines.length - 1 ? '1px solid #e5e7eb' : 'none',
                      backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f4f8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : 'white';
                    }}
                    onClick={() => handleDeadlineClick(deadline.assignment_id)}
                  >
                    <td style={{ padding: '1rem', color: '#1f2937', fontWeight: '500' }}>
                      {deadline.subject}
                    </td>
                    <td style={{ padding: '1rem', color: '#4b5563' }}>
                      {deadline.title}
                    </td>
                    <td style={{ padding: '1rem', color: '#4b5563' }}>
                      {formatDate(deadline.deadline)}
                    </td>
                    <td style={{ padding: '1rem', color: '#4b5563', fontWeight: '500' }}>
                      {getTimeRemaining(deadline.deadline)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e5e7eb',
          marginTop: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Quick Overview
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {assignmentCount}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Pending
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {upcomingDeadlines.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Upcoming
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {user.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Logged In
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
