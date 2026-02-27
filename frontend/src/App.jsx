import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddFaculty from './pages/AdminAddFaculty';
import AdminAddStudent from './pages/AdminAddStudent';
import ManageStudents from './pages/ManageStudents';
import ManageFaculty from './pages/ManageFaculty';
import FacultyStudentView from './pages/FacultyStudentView';
import StudentPerformance from './pages/StudentPerformance';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyAssignments from './pages/FacultyAssignments';
import FacultyAssignmentDetails from './pages/FacultyAssignmentDetails';
import FacultyPendingEvaluation from './pages/FacultyPendingEvaluation';
import CreateAssignment from './pages/CreateAssignment';
import Marks from './pages/Marks';
import StudentDashboard from './pages/StudentDashboard';
import StudentAssignments from './pages/StudentAssignments';
import StudentMarks from './pages/StudentMarks';
import StudentPendingAssignments from './pages/StudentPendingAssignments';
import StudentMarksAnalytics from './pages/StudentMarksAnalytics';
import StudentProfile from './pages/StudentProfile';
import AssignmentDetails from './pages/AssignmentDetails';
import AssignmentAnalytics from './pages/AssignmentAnalytics';

import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';

// This component will wrap our dashboard pages
const DashboardLayout = () => {
  // Safely parse user data from localStorage
  let user = { name: 'Guest', role: 'student' }; // Default user
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure parsedUser is an object and has expected properties
      if (typeof parsedUser === 'object' && parsedUser !== null) {
        // prefer parsed user fields when available
        user.name = parsedUser.name || user.name;
        user.role = parsedUser.role || user.role;
      }
    }
    // If no role from user object, check the role localStorage key
    if (!user.role) {
      const roleFlag = localStorage.getItem('role');
      if (roleFlag) user.role = roleFlag;
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    // Continue with default user
  }

  console.log("Current user in DashboardLayout:", user); // Temporary log for debugging

  return (
    <div className="app-layout">
      <Sidebar userRole={user.role} />
      <div className="main-wrapper">
        <TopNavbar userName={user.name} />
        <main className="content-area">
          <Outlet /> {/* Child routes will render here */}
        </main>
      </div>
    </div>
  );
};

function App() {
  // Read role synchronously on first render - no async delays
  const [userRole, setUserRole] = useState(() => {
    try {
      const roleFlag = localStorage.getItem('role');
      console.log('[App] Sync init: localStorage["role"]:', roleFlag);
      if (roleFlag) return roleFlag;
      
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const role = parsed?.role || null;
        console.log('[App] Sync init: from localStorage["user"].role:', role);
        return role;
      }
    } catch (e) {
      console.error('[App] Sync init error:', e);
    }
    return null;
  });

  // Listen for role changes from localStorage (same tab and cross-tab)
  useEffect(() => {
    // Handle storage changes from OTHER tabs
    const handleStorageChange = (e) => {
      console.log('[App] Storage change detected (cross-tab):', e.key);
      if (e.key === 'role' || e.key === 'user') {
        try {
          const roleFlag = localStorage.getItem('role');
          if (roleFlag) {
            console.log('[App] Updating role to:', roleFlag);
            setUserRole(roleFlag);
            return;
          }
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            const role = parsed?.role || null;
            console.log('[App] Updating role from user to:', role);
            setUserRole(role);
            return;
          }
        } catch (e) {
          console.error('[App] Storage update error:', e);
        }
        console.log('[App] No role found, clearing');
        setUserRole(null);
      }
    };

    // Handle custom event for same-tab storage changes (login/logout)
    const handleRoleChange = (e) => {
      console.log('[App] Custom roleChange event detected:', e.detail);
      setUserRole(e.detail.role);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roleChange', handleRoleChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roleChange', handleRoleChange);
    };
  }, []);

  // Helper to determine if current user is admin
  const isAdmin = () => {
    const result = userRole === 'admin';
    console.log('[App.isAdmin] role:', userRole, '-> result:', result);
    return result;
  };

  // Helper to determine if current user is faculty
  const isFaculty = () => {
    const result = userRole === 'faculty';
    console.log('[App.isFaculty] role:', userRole, '-> result:', result);
    return result;
  };

  // Helper to determine if current user is student
  const isStudent = () => {
    const result = userRole === 'student';
    console.log('[App.isStudent] role:', userRole, '-> result:', result);
    return result;
  };

  // Debug route guard evaluation
  const RequireRole = ({ children, requiredRole, roleName }) => {
    const hasRole = userRole === requiredRole;
    console.log(`[RequireRole] Checking ${roleName}: userRole="${userRole}", required="${requiredRole}", allowed=${hasRole}`);
    if (!hasRole) {
      console.log(`[RequireRole] Denying access to ${roleName}, redirecting to /login`);
      return <Navigate to="/login" replace />;
    }
    console.log(`[RequireRole] Allowing access to ${roleName}`);
    return children;
  };

  return (
    <Routes>
      {/* Public login routes (no sidebar/navbar) */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* All dashboard routes are children of DashboardLayout */}
      <Route element={<DashboardLayout />}>
        {/* Admin Routes (frontend guard) */}
        <Route path="/admin-dashboard" element={<RequireRole requiredRole="admin" roleName="admin-dashboard"><AdminDashboard /></RequireRole>} />
        <Route path="/admin/faculty/add" element={<RequireRole requiredRole="admin" roleName="admin/faculty/add"><AdminAddFaculty /></RequireRole>} />
        <Route path="/admin/student/add" element={<RequireRole requiredRole="admin" roleName="admin/student/add"><AdminAddStudent /></RequireRole>} />
        <Route path="/admin/manage-students" element={<RequireRole requiredRole="admin" roleName="admin/manage-students"><ManageStudents /></RequireRole>} />
        <Route path="/admin/manage-faculty" element={<RequireRole requiredRole="admin" roleName="admin/manage-faculty"><ManageFaculty /></RequireRole>} />
        
        {/* Faculty Routes */}
        <Route path="/faculty-dashboard" element={<RequireRole requiredRole="faculty" roleName="faculty-dashboard"><FacultyDashboard /></RequireRole>} />
        <Route path="/faculty-assignments" element={<RequireRole requiredRole="faculty" roleName="faculty-assignments"><FacultyAssignments /></RequireRole>} />
        <Route path="/faculty/pending-evaluations" element={<RequireRole requiredRole="faculty" roleName="faculty/pending-evaluations"><FacultyPendingEvaluation /></RequireRole>} />
        <Route path="/faculty/assignments/create" element={<RequireRole requiredRole="faculty" roleName="faculty/assignments/create"><CreateAssignment /></RequireRole>} />
        <Route path="/faculty/students" element={<RequireRole requiredRole="faculty" roleName="faculty/students"><FacultyStudentView /></RequireRole>} />
        <Route path="/faculty/marks" element={<RequireRole requiredRole="faculty" roleName="faculty/marks"><Marks /></RequireRole>} />
        <Route path="/assignment-details/:assignmentId" element={<RequireRole requiredRole="faculty" roleName="assignment-details"><FacultyAssignmentDetails /></RequireRole>} />
        <Route path="/faculty/student-performance/:enrollment_no" element={<RequireRole requiredRole="faculty" roleName="faculty/student-performance"><StudentPerformance /></RequireRole>} />
        
        {/* Student Routes */}
        <Route path="/student-dashboard" element={<RequireRole requiredRole="student" roleName="student-dashboard"><StudentDashboard /></RequireRole>} />
        <Route path="/student/pending-assignments" element={<RequireRole requiredRole="student" roleName="student/pending-assignments"><StudentPendingAssignments /></RequireRole>} />
        <Route path="/student/marks-analytics" element={<RequireRole requiredRole="student" roleName="student/marks-analytics"><StudentMarksAnalytics /></RequireRole>} />
        <Route path="/student/profile" element={<RequireRole requiredRole="student" roleName="student/profile"><StudentProfile /></RequireRole>} />
        <Route path="/student-assignments" element={<RequireRole requiredRole="student" roleName="student-assignments"><StudentAssignments /></RequireRole>} />
        <Route path="/student-marks" element={<RequireRole requiredRole="student" roleName="student-marks"><StudentMarks /></RequireRole>} />
        <Route path="/assignment/:assignmentId" element={<RequireRole requiredRole="student" roleName="assignment"><AssignmentDetails /></RequireRole>} />
        <Route path="/analytics/:assignmentId" element={<RequireRole requiredRole="student" roleName="analytics"><AssignmentAnalytics /></RequireRole>} />
        <Route path="/student/performance/:enrollment_no" element={<RequireRole requiredRole="student" roleName="student/performance"><StudentPerformance /></RequireRole>} />
        {/* Add other authenticated routes here */}
      </Route>
      
      {/* You can add a 404 page here */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;



