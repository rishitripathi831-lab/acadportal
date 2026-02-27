import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/manage.css';

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/faculty');
      setFaculty(response.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch faculty');
      console.error('Fetch faculty error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (facultyMember) => {
    setEditingFaculty(facultyMember.faculty_id);
    setFormData({ ...facultyMember });
  };

  const handleCancel = () => {
    setEditingFaculty(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      setError('Name is required');
      return;
    }

    try {
      await api.put(`/admin/faculty/${editingFaculty}`, {
        name: formData.name
      });
      setError('');
      setEditingFaculty(null);
      setFormData({});
      fetchFaculty();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update faculty');
      console.error('Update error:', err);
    }
  };

  const handleDeleteConfirm = (facultyId) => {
    setDeleteConfirm(facultyId);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await api.delete(`/admin/faculty/${deleteConfirm}`);
      console.log('Delete response:', response);
      setError('');
      setDeleteConfirm(null);
      await fetchFaculty();
    } catch (err) {
      console.error('Delete error details:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete faculty';
      setError(errorMsg);
    }
  };

  return (
    <div className="page-container">
      <div className="manage-container">
        <div className="manage-header">
          <h1>Manage Faculty</h1>
          <button className="btn btn-primary" onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading faculty...</div>
        ) : faculty.length === 0 ? (
          <div className="no-data">No faculty found</div>
        ) : (
          <div className="table-container">
            <table className="manage-table">
              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map(facultyMember => (
                  <tr key={facultyMember.faculty_id} className={editingFaculty === facultyMember.faculty_id ? 'editing' : ''}>
                    <td>{facultyMember.faculty_id}</td>
                    <td>
                      {editingFaculty === facultyMember.faculty_id ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          className="edit-input"
                        />
                      ) : (
                        facultyMember.name
                      )}
                    </td>
                    <td className="actions">
                      {editingFaculty === facultyMember.faculty_id ? (
                        <>
                          <button className="btn btn-success btn-sm" onClick={handleSave}>Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={handleCancel}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-edit btn-sm" onClick={() => handleEdit(facultyMember)}>Edit</button>
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

export default ManageFaculty;
