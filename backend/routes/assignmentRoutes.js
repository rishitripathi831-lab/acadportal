const express = require("express");
const { uploadAssignment } = require("../config/multer");
const {
  createAssignment,
  getAssignmentsByClass,
  getAssignmentsByFaculty,
  getAssignmentDetails,
  getSubmissionStats,
  getSubmissionList,
} = require("../controllers/assignmentController");

const router = express.Router();

router.post("/create", uploadAssignment.single("assignment_file"), createAssignment);
router.get("/class/:class_id", getAssignmentsByClass);

// NEW: Faculty assignment endpoints
router.get("/faculty/:faculty_id", getAssignmentsByFaculty);
router.get("/details/:assignment_id", getAssignmentDetails);
router.get("/stats/:assignment_id", getSubmissionStats);
router.get("/submissions/:assignment_id", getSubmissionList);

module.exports = router;
