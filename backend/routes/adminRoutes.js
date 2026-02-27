const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// POST /api/admin/login
router.post('/login', adminController.login);

// POST /api/admin/faculty/add
router.post('/faculty/add', adminController.addFaculty);

// POST /api/admin/student/add
router.post('/student/add', adminController.addStudent);

// GET /api/admin/students
router.get('/students', adminController.getAllStudents);

// GET /api/admin/faculty
router.get('/faculty', adminController.getAllFaculty);

// PUT /api/admin/students/:enrollment_no
router.put('/students/:enrollment_no', adminController.updateStudent);

// PUT /api/admin/faculty/:faculty_id
router.put('/faculty/:faculty_id', adminController.updateFaculty);

// DELETE /api/admin/students/:enrollment_no
router.delete('/students/:enrollment_no', adminController.deleteStudent);

// DELETE /api/admin/faculty/:faculty_id
router.delete('/faculty/:faculty_id', adminController.deleteFaculty);

module.exports = router;
