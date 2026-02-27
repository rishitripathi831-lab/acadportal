import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { createAssignment } from '../services/api';

const years = ['First Year','Second Year','Third Year','Fourth Year'];
const branches = ['CSE','CE','ME','EE','ECE'];

const CreateAssignment = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const [year, setYear] = useState('Third Year');
  const [semester, setSemester] = useState(3);
  const [branch, setBranch] = useState('CSE');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // try to set semester based on year
    const map = { 'First Year': [1,2], 'Second Year':[3,4], 'Third Year':[5,6], 'Fourth Year':[7,8] };
    const s = map[year] ? map[year][0] : 1;
    setSemester(s);
  }, [year]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAssignmentFile(file);
      setFileName(file.name);
    } else {
      setAssignmentFile(null);
      setFileName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !deadline) {
      setError('Please provide title and deadline');
      return;
    }
    if (!user.id) {
      setError('Not logged in');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('deadline', deadline);
      formData.append('faculty_id', user.id);
      formData.append('branch', branch);
      formData.append('semester', semester);
      formData.append('year', year);
      if (assignmentFile) {
        formData.append('assignment_file', assignmentFile);
      }

      const res = await createAssignment(formData);
      // success
      navigate('/faculty-assignments');
    } catch (err) {
      console.error('Create assignment failed', err);
      setError(err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1rem' }}>
        <h1>Create Assignment</h1>
        <p style={{ color: '#666' }}>Add a new assignment for a class.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label className="form-label">Year</label>
            <select className="form-control" value={year} onChange={(e)=>setYear(e.target.value)}>
              {years.map(y=> <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Semester</label>
            <select className="form-control" value={semester} onChange={(e)=>setSemester(parseInt(e.target.value))}>
              {[1,2,3,4,5,6,7,8].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Branch</label>
            <select className="form-control" value={branch} onChange={(e)=>setBranch(e.target.value)}>
              {branches.map(b=> <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Assignment Title</label>
            <input className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="DBMS Assignment – Normalization" />
          </div>
          <div>
            <label className="form-label">Subject (optional)</label>
            <input className="form-control" value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="Database Systems" />
          </div>
          <div>
            <label className="form-label">Deadline</label>
            <input className="form-control" type="date" value={deadline} onChange={(e)=>setDeadline(e.target.value)} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Upload Assignment File</label>
            <input 
              className="form-control" 
              type="file" 
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={handleFileChange}
            />
            {fileName && <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#059669' }}>Selected: {fileName}</p>}
          </div>
          {error && <div style={{ marginTop: '1rem', color: '#991b1b' }}>{error}</div>}
          <div className="form-actions">
            <button className="btn primary"style={{position:'relative',top:'0px'}} type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Assignment'}</button>
            <button className="btn" type="button" onClick={()=>navigate('/faculty-assignments')}>Cancel</button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateAssignment;
