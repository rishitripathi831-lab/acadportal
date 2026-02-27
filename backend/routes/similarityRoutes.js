const express = require('express');
const { getSimilarity, checkAssignmentSimilarity } = require('../controllers/similarityController');

const router = express.Router();

router.post("/check", getSimilarity);
router.post("/assignment", checkAssignmentSimilarity);

module.exports = router;
