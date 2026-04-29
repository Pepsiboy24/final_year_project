const express = require('express');
const attendanceService = require('../services/attendance.service');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

// Teacher creates attendance log for a student
router.post('/', authorizeRoles('teacher'), async (req, res) => {
  try {
    const { studentId, courseCode, status, date } = req.body;
    if (!studentId || !courseCode || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const record = await attendanceService.logAttendance(studentId, courseCode, status, date);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Teacher views attendance logs for a course
router.get('/:courseCode', authorizeRoles('teacher'), async (req, res) => {
  try {
    const records = await attendanceService.getAttendanceRecords(req.params.courseCode, req.query.date);
    res.json(records);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
