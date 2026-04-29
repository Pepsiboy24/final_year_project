const express = require('express');
const courseService = require('../services/course.service');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

// Internal inter-service route
router.get('/:courseId', async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.courseId);
    res.json({ course });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.use(authenticateToken);

// Create a course (Teacher only)
router.post('/', authorizeRoles('teacher'), async (req, res) => {
  try {
    const { code, title, credits } = req.body;
    if (!code || !title || !credits) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const course = await courseService.createCourse(code, title, credits);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all courses (Anyone logged in)
router.get('/', async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll locally logged in student
router.post('/enroll', authorizeRoles('student'), async (req, res) => {
  try {
    const { courseCode } = req.body;
    if (!courseCode) {
      return res.status(400).json({ error: 'Missing courseCode' });
    }
    const enrollment = await courseService.enrollStudent(req.user.id, courseCode);
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get logged in student's enrollments
router.get('/enrollments', authorizeRoles('student'), async (req, res) => {
  try {
    const enrollments = await courseService.getStudentEnrollments(req.user.id);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
