const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Specific routes BEFORE parameterized routes
// GET /api/student/class/:branch/:semester - get students by class
router.get('/class/:branch/:semester', studentController.getStudentsByClass);

// GET /api/student/profile/:id - Get student profile
router.get('/profile/:id', studentController.getProfile);

// PUT /api/student/profile/:id - Update email
router.put('/profile/:id', studentController.updateEmail);

// PUT /api/student/password/:id - Update password
router.put('/password/:id', studentController.updatePassword);

// GET /api/student/upcoming-deadlines/:id - Get upcoming deadlines
router.get('/upcoming-deadlines/:id', studentController.getUpcomingDeadlines);

// GET /api/student/performance/:enrollment_no/:faculty_id
router.get('/performance/:enrollment_no/:faculty_id', studentController.getStudentPerformance);

// Parameterized routes AFTER specific routes
// GET /api/student/assignments/:enrollmentNo - pending assignments (matching frontend path)
router.get('/assignments/:enrollmentNo', studentController.getStudentPendingAssignments);

// Backwards-compatible parameterized route
// GET /api/student/:id/assignments
router.get('/:id/assignments', studentController.getAssignments);

// GET /api/student/:id/marks
router.get('/:id/marks', studentController.getMarks);

// Note: student creation is now managed by Admin routes only.
// POST /api/student/add moved to admin routes for role-based control.

module.exports = router;
