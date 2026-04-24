const express = require('express');
const studentService = require('../services/student.service');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

// Create student profile
router.post('/profile', authorizeRoles('student'), async (req, res) => {
  try {
    const { reg_number, level, department } = req.body;
    const userId = req.user.id;
    
    if (!reg_number || !level || !department) {
      return res.status(400).json({ error: 'Missing required profile fields' });
    }

    const profile = await studentService.createProfile(userId, reg_number, level, department);
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get own profile (student) or get by Teacher
router.get('/profile', async (req, res) => {
  try {
    const profile = await studentService.getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Teacher views any student profile
router.get('/:studentId/profile', authorizeRoles('teacher'), async (req, res) => {
  try {
    const profile = await studentService.getProfile(req.params.studentId);
    res.json(profile);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', authorizeRoles('student'), async (req, res) => {
  try {
    const profile = await studentService.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
