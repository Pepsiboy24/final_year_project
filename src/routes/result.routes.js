const express = require('express');
const router = express.Router();
const ResultService = require('../services/result.service');

// POST /
// Single point of entry for high-concurrency simulation
router.post('/', async (req, res, next) => {
    try {
        const { student_id, course_id, score } = req.body;
        if (!student_id || !course_id || score === undefined) {
            return res.status(400).json({ error: 'student_id, course_id, and score are required' });
        }
        
        const result = await ResultService.enterGrade(student_id, course_id, score);
        res.status(201).json({ message: 'Result entered successfully', result });
    } catch (error) {
        next(error);
    }
});

// GET /student/:id
router.get('/student/:id', async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const data = await ResultService.getStudentResults(studentId);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
