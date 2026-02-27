import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { FaUserTie, FaUserGraduate } from 'react-icons/fa';

const AdminDashboard = () => {
  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Complete control over faculty and student management</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <FaUserTie style={{ fontSize: '2rem', color: '#2563eb', marginRight: '0.75rem' }} />
            <h3 style={{ margin: 0 }}>Add Faculty</h3>
          </div>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Create new faculty accounts and manage access</p>
          <Link to="/admin/faculty/add" className="btn primary" style={{ display: 'inline-block' ,marginTop :'15px'}}>Create Faculty</Link>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <FaUserGraduate style={{ fontSize: '2rem', color: '#059669', marginRight: '0.75rem' }} />
            <h3 style={{ margin: 0 }}>Add Student</h3>
          </div>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Register new students and assign to classes</p>
          <Link to="/admin/student/add" className="btn primary" style={{ display: 'inline-block',marginTop :'15px' }}>Create Student</Link>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <FaUserTie style={{ fontSize: '2rem', color: '#8b5cf6', marginRight: '0.75rem' }} />
            <h3 style={{ margin: 0 }}>Manage Faculty</h3>
          </div>
          <p style={{ color: '#666', marginBottom: '1rem' }}>View and manage all faculty accounts</p>
          <Link to="/admin/manage-faculty" className="btn primary" style={{ display: 'inline-block' ,marginTop :'15px'}}>View Faculty</Link>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <FaUserGraduate style={{ fontSize: '2rem', color: '#f59e0b', marginRight: '0.75rem' }} />
            <h3 style={{ margin: 0 }}>Manage Students</h3>
          </div>
          <p style={{ color: '#666', marginBottom: '1rem' }}>View, edit, and manage student records</p>
          <Link to="/admin/manage-students" className="btn primary" style={{ display: 'inline-block',marginTop :'15px' }}>View Students</Link>
        </Card>

      </div>

      <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <h3 style={{ marginTop: 0 }}>System Info</h3>
        <p style={{ color: '#1e40af', marginBottom: '0.5rem' }}>✓ Admin Portal Active</p>
        <p style={{ color: '#1e40af', marginBottom: 0 }}>✓ Role-based access control enabled</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
