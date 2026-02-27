import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaUserGraduate, FaClipboardList, FaChartPie, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { getFacultyAssignments } from '../services/api';

const Sidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const [expandAssignments, setExpandAssignments] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    if (userRole === 'faculty' && expandAssignments && assignments.length === 0) {
      const fetchAssignments = async () => {
        try {
          setLoadingAssignments(true);
          if (user.id) {
            const data = await getFacultyAssignments(user.id);
            setAssignments(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Error fetching assignments:', error);
        } finally {
          setLoadingAssignments(false);
        }
      };
      fetchAssignments();
    }
  }, [expandAssignments, userRole, user.id, assignments.length]);

  const handleLogout = () => {
    console.log('handleLogout: Removing user and role from localStorage');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    console.log('handleLogout: Navigating to /login');
    navigate('/login');
  };

  const facultyLinks = [
    { name: 'Dashboard', path: '/faculty-dashboard', icon: <FaTachometerAlt /> },
    { name: 'Assignments', path: '/faculty-assignments', icon: <FaClipboardList /> },
    { name: 'My Students', path: '/faculty/students', icon: <FaUserGraduate /> },
    { name: 'Marks', path: '/faculty/marks', icon: <FaChartPie /> },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/student-dashboard', icon: <FaTachometerAlt /> },
    { name: 'My Assignments', path: '/student-assignments', icon: <FaBook /> },
    { name: 'My Marks', path: '/student-marks', icon: <FaClipboardList /> },
  ];

  const displayLinks = userRole === 'faculty' ? facultyLinks : studentLinks;

  // Admin-specific
  if (userRole === 'admin') {
    return (
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">AcadPortal — Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            <li>
              <NavLink to="/admin-dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <FaTachometerAlt /> <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/faculty/add" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <FaUserGraduate /> <span>Add Faculty</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/student/add" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <FaClipboardList /> <span>Add Student</span>
              </NavLink>
            </li>
            <li style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', borderRadius: '0.375rem', fontSize: '0.95rem', fontWeight: '500' }}>
                <FaSignOutAlt style={{ color: '#dc2626' }} /> <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    );
  }

  const truncateText = (text, maxLength = 25) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">AcadPortal</h2>
      </div>
      <nav className="sidebar-nav">
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {displayLinks.map((link) => (
            <li key={link.name}>
              <NavLink 
                to={link.path} 
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            </li>
          ))}

          {/* Faculty Expandable Assignments Section */}
          {userRole === 'faculty' && (
            <li style={{ marginTop: '1rem' }}>
              <button
                onClick={() => setExpandAssignments(!expandAssignments)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: expandAssignments ? '#eff6ff' : 'transparent',
                  border: 'none',
                  color: expandAssignments ? '#2563eb' : '#666',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                  fontSize: '0.95rem',
                  fontWeight: expandAssignments ? '600' : '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = expandAssignments ? '#eff6ff' : 'transparent';
                }}
              >
                <FaClipboardList style={{ color: '#2563eb' }} />
                <span style={{ flex: 1, textAlign: 'left' }}>My Assignments</span>
                <FaChevronDown
                  style={{
                    transform: expandAssignments ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    fontSize: '0.75rem',
                  }}
                />
              </button>

              {/* Expandable Assignments List */}
              {expandAssignments && (
                <div
                  style={{
                    backgroundColor: '#f9fafb',
                    borderLeft: '3px solid #2563eb',
                    marginTop: '0.25rem',
                    paddingLeft: '0.5rem',
                  }}
                >
                  {loadingAssignments ? (
                    <div style={{ padding: '0.75rem 1rem', color: '#999', fontSize: '0.85rem' }}>
                      Loading...
                    </div>
                  ) : assignments.length === 0 ? (
                    <div style={{ padding: '0.75rem 1rem', color: '#999', fontSize: '0.85rem' }}>
                      No assignments
                    </div>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {assignments.map((assignment) => (
                        <li key={assignment.assignment_id}>
                          <button
                            onClick={() => navigate(`/assignment-details/${assignment.assignment_id}`)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              padding: '0.5rem 1rem',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#666',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              textAlign: 'left',
                              transition: 'all 0.2s',
                              borderRadius: '0.25rem',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#eff6ff';
                              e.currentTarget.style.color = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#666';
                            }}
                          >
                            <span style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                              {truncateText(assignment.title)}
                            </span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                              {assignment.submitted || 0} / {assignment.total_students || 0} submitted
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          )}

          {/* Logout Link */}
          <li style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                borderRadius: '0.375rem',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
            >
              <FaSignOutAlt style={{ color: '#dc2626' }} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
