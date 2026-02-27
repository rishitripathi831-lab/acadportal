const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const assignmentsDir = path.join(__dirname, '../uploads/assignments');
const submissionsDir = path.join(__dirname, '../uploads/submissions');

if (!fs.existsSync(assignmentsDir)) {
  fs.mkdirSync(assignmentsDir, { recursive: true });
}
if (!fs.existsSync(submissionsDir)) {
  fs.mkdirSync(submissionsDir, { recursive: true });
}

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: PDF, PPT, PPTX, DOC, DOCX`));
  }
};

// Configure storage for assignments
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, assignmentsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  },
});

// Configure storage for submissions
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, submissionsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: enrollment-timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  },
});

// Create multer instances for different upload types
const uploadAssignment = multer({
  storage: assignmentStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

const uploadSubmission = multer({
  storage: submissionStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

module.exports = { uploadAssignment, uploadSubmission };
