// frontend/src/services/api.js

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if your backend runs on a different port
});

export const login = async ({ role, id, password }) => {
  try {
    const response = await API.post('/auth/login', { role, id, password });
    // Expected response: { message: 'Login successful', user: { id, name, role } }
    return response.data;
  } catch (error) {
    // If server returns structured error message, surface that
    const msg = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(msg);
  }
};

// ===== FACULTY ASSIGNMENT ENDPOINTS =====
export const getFacultyAssignments = async (facultyId) => {
  try {
    const response = await API.get(`/assignment/faculty/${facultyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching faculty assignments:', error);
    throw error;
  }
};

export const getAssignmentDetails = async (assignmentId) => {
  try {
    const response = await API.get(`/assignment/details/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    throw error;
  }
};

export const getSubmissionStats = async (assignmentId) => {
  try {
    const response = await API.get(`/assignment/stats/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    throw error;
  }
};

export const getSubmissionList = async (assignmentId) => {
  try {
    const response = await API.get(`/assignment/submissions/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching submission list:', error);
    throw error;
  }
};

// ===== STUDENT ENDPOINTS =====
export const getStudentAssignments = async (studentId) => {
  try {
    const response = await API.get(`/student/${studentId}/assignments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    throw error;
  }
};

export const getStudentMarks = async (studentId) => {
  try {
    const response = await API.get(`/student/${studentId}/marks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student marks:', error);
    throw error;
  }
};

// ===== CREATE ASSIGNMENT =====
export const createAssignment = async (payload) => {
  try {
    // Check if payload is FormData (file upload) or JSON
    const isFormData = payload instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    
    const response = await API.post('/assignment/create', payload, config);
    return response.data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// ===== ADMIN ROUTES (FACULTY & STUDENT CREATION) =====
export const addFacultyAdmin = async (payload) => {
  try {
    const response = await API.post('/admin/faculty/add', payload);
    console.log('Faculty added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding faculty:', error.response?.data || error.message);
    throw error;
  }
};

export const addStudentAdmin = async (payload) => {
  try {
    const response = await API.post('/admin/student/add', payload);
    console.log('Student added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding student:', error.response?.data || error.message);
    throw error;
  }
};

// ===== STUDENT MANAGEMENT =====
// Student/Faculty creation is now handled by Admin routes only
// Use API.post('/admin/student/add', payload) for admin-controlled student creation

export const getStudentsByClass = async (branch, semester) => {
  try {
    const response = await API.get(`/student/class/${branch}/${semester}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class:', error);
    throw error;
  }
};

// ===== MARKS =====
// Upsert marks - supports new format with obtained_marks and total_marks
export const upsertMarks = async (payload) => {
  try {
    // payload format:
    // { enrollment_no, subject, exam_type: 'mid1'|'mid2', obtained_marks: value, total_marks: value }
    // Returns: { message, data: { marks_id, enrollment_no, subject, mid1_marks, mid1_total, ... } }
    const response = await API.post('/marks/upsert', payload);
    return response.data;
  } catch (error) {
    console.error('Error saving marks:', error);
    throw error;
  }
};

export const getMarksByClass = async (branch, semester, subject) => {
  try {
    const response = await API.get('/marks/class', { params: { branch, semester, subject } });
    return response.data;
  } catch (error) {
    console.error('Error fetching marks by class:', error);
    throw error;
  }
};

export const getMarksForStudent = async (enrollment_no) => {
  try {
    const response = await API.get(`/marks/student/${enrollment_no}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student marks:', error);
    throw error;
  }
};

// ===== STUDENT SUBMISSION ENDPOINTS =====
export const submitAssignment = async (payload) => {
  try {
    // Check if payload is FormData
    if (payload instanceof FormData) {
      const response = await axios.post('http://localhost:5000/api/submission/submit', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // For non-FormData payloads (unlikely case)
      const response = await API.post('/submission/submit', payload);
      return response.data;
    }
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

// Mark submission as checked (faculty evaluation)
export const markSubmissionChecked = async (submissionId, facultyId) => {
  try {
    const response = await API.put('/submission/mark-checked', {
      submission_id: submissionId,
      faculty_id: facultyId,
    });
    return response.data;
  } catch (error) {
    console.error('Error marking submission as checked:', error);
    throw error;
  }
};

export default API;