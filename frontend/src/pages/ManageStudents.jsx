import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/manage.css';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student.enrollment_no);
    setFormData({ ...student });
  };

  const handleCancel = () => {
    setEditingStudent(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.department || !formData.semester) {
      setError('All fields are required');
      return;
    }

    try {
      await api.put(`/admin/students/${editingStudent}`, {
        name: formData.name,
        department: formData.department,
        semester: formData.semester
      });
      setError('');
      setEditingStudent(null);
      setFormData({});
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
      console.error('Update error:', err);
    }
  };

  const handleDeleteConfirm = (enrollmentNo) => {
    setDeleteConfirm(enrollmentNo);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await api.delete(`/admin/students/${deleteConfirm}`);
      console.log('Delete response:', response);
      setError('');
      setDeleteConfirm(null);
      await fetchStudents();
    } catch (err) {
      console.error('Delete error details:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete student';
      setError(errorMsg);
    }
  };

  return (
    <div className="page-container">
      <div className="manage-container">
        <div className="manage-header">
          <h1>Manage Students</h1>
          <button className="btn btn-primary" onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="no-data">No students found</div>
        ) : (
          <div className="table-container">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Enrollment No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.enrollment_no} className={editingStudent === student.enrollment_no ? 'editing' : ''}>
                    <td>{student.enrollment_no}</td>
                    <td>
                      {editingStudent === student.enrollment_no ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          className="edit-input"
                        />
                      ) : (
                        student.name
                      )}
                    </td>
                    <td>
                      {editingStudent === student.enrollment_no ? (
                        <input
                          type="text"
                          name="department"
                          value={formData.department || ''}
                          onChange={handleInputChange}
                          className="edit-input"
                        />
                      ) : (
                        student.department
                      )}
                    </td>
                    <td>
                      {editingStudent === student.enrollment_no ? (
                        <input
                          type="number"
                          name="semester"
                          value={formData.semester || ''}
                          onChange={handleInputChange}
                          className="edit-input"
                        />
                      ) : (
                        student.semester
                      )}
                    </td>
                    <td className="actions">
                      {editingStudent === student.enrollment_no ? (
                        <>
                          <button className="btn btn-success btn-sm" onClick={handleSave}>Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-edit btn-sm" onClick={() => handleEdit(student)}>Edit</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStudents;
