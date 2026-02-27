const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');

// POST /api/marks/upsert - insert or update marks
router.post('/upsert', marksController.upsertMarks);

// GET /api/marks/class?branch=...&semester=...&subject=...
router.get('/class', marksController.getMarksByClass);

// GET /api/marks/student/:enrollment_no
router.get('/student/:enrollment_no', marksController.getMarksForStudent);

module.exports = router;