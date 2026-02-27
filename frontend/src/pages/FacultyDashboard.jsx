import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaClock, FaUsers } from 'react-icons/fa';
import Card from '../components/Card';
import { getFacultyAssignments, getSubmissionStats } from '../services/api';
import '../styles/pages.css';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingEvaluations: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (!user.id) {
        console.log('No user ID found');
        return;
      }

      // Fetch assignments
      const assignmentsData = await getFacultyAssignments(user.id);
      const assignmentsList = Array.isArray(assignmentsData) ? assignmentsData : [];
      setAssignments(assignmentsList);
      console.log('Assignments data:', assignmentsList);
      console.log('First assignment data:', assignmentsList[0]);

      // Calculate stats
      const totalAssignments = assignmentsList.length;
      const pendingEvaluations = assignmentsList.reduce((sum, a) => {
        console.log('Processing assignment:', a.title, 'pending field:', a.pending);
        const pending = a.pending || 0;
        return sum + pending;
      }, 0);
      const totalStudents = assignmentsList.length > 0 ? assignmentsList[0].total_students : 0;

      console.log('Stats calculated - Total Assignments:', totalAssignments, 'Pending Evaluations:', pendingEvaluations);
      setStats({
        totalAssignments,
        pendingEvaluations,
        totalStudents,
      });

      // Get upcoming deadlines (next 3)
      const upcoming = assignmentsList
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3);
      setUpcomingDeadlines(upcoming);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('FacultyDashboard mounted or location changed, refreshing data');
    fetchDashboardData();
  }, [location.pathname]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="faculty-dashboard-page">
      <h2 className="dashboard-section-title">Faculty Dashboard</h2>

      {/* Dashboard Cards Grid */}
      <div
        className="dashboard-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Assignments Card */}
        <Card
          style={{
            borderLeft: '4px solid #2563eb',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.15)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#dbeafe',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
                fontSize: '1.5rem',
              }}
            >
              <FaBook />
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Total Assignments</p>
              <p style={{ margin: '0', fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.totalAssignments}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/faculty-assignments')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e40af')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            View All
          </button>
        </Card>

        {/* Pending Evaluations Card */}
        <Card
          style={{
            borderLeft: '4px solid #f59e0b',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(245, 158, 11, 0.15)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#fef3c7',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
                fontSize: '1.5rem',
              }}
            >
              <FaClock />
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Pending Evaluations</p>
              <p style={{ margin: '0', fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.pendingEvaluations}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/faculty/pending-evaluations')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d97706')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f59e0b')}
          >
            Review Now
          </button>
        </Card>

        {/* Create New Assignment Card */}
        <Card
          style={{
            borderLeft: '4px solid #8b5cf6',
            transition: 'all 0.3s ease',

          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.15)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#ede9fe',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
                fontSize: '1.5rem',
              }}
            >
              <FaBook />
            </div>
            <div>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>New Assignment</p>
              <p style={{ margin: '0', fontSize: '1.3rem', fontWeight: 'bold', color: '#1f2937' }}>
                Create Now
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/faculty/assignments/create')}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
              position:'relative',
              top:'15px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b5cf6')}
          >
            Create Assignment
          </button>
        </Card>
      </div>

      {/* Upcoming Deadlines Card */}
      <Card>
        <div className="card-header" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            Upcoming Deadlines
          </h3>
        </div>
        <div className="card-content">
          {upcomingDeadlines.length > 0 ? (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {upcomingDeadlines.map((item, idx) => (
                <li
                  key={item.assignment_id}
                  style={{
                    padding: '1rem',
                    borderBottom: idx !== upcomingDeadlines.length - 1 ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => navigate(`/assignment-details/${item.assignment_id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div>
                    <strong style={{ color: '#1f2937' }}>{item.title}</strong>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                      {item.subject} • {item.submitted || 0} / {item.total_students || 0} submitted
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDate(item.deadline)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#666', margin: 0 }}>No upcoming deadlines.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FacultyDashboard;