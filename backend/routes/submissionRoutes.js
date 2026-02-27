const express = require('express');
const router = express.Router();
const { uploadSubmission } = require('../config/multer');
const submissionController = require('../controllers/submissionController');

// Student submits assignment
router.post('/submit', uploadSubmission.single('assignment_file'), submissionController.submitAssignment);

// Mark submission as checked (faculty)
router.put('/mark-checked', submissionController.markSubmissionChecked);

// Get all pending submissions for a faculty
router.get('/pending/:faculty_id', submissionController.getPendingSubmissions);

// Get submission details
router.get('/details/:submission_id', submissionController.getSubmissionDetails);

// Get all submissions for a student
router.get('/student/:enrollment_no', submissionController.getStudentSubmissions);

module.exports = router;
