require("dotenv").config({
  path: "./project.env"
});
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables
dotenv.config({ path: './project.env' });

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('MySQL Connected...');
});

// Define a simple route for testing
app.get('/', (req, res) => {
  res.send('AcadPortal API is running...');
});

// Import and use routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
// student routes (assignments, marks)
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/student', studentRoutes);
// assignment routes
const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/assignment', assignmentRoutes);
// similarity routes (AI feature)
const similarityRoutes = require('./routes/similarityRoutes');
app.use('/api/similarity', similarityRoutes);

// marks routes
const marksRoutes = require('./routes/marksRoutes');
app.use('/api/marks', marksRoutes);

// submission routes
const submissionRoutes = require('./routes/submissionRoutes');
app.use('/api/submission', submissionRoutes);

// admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
