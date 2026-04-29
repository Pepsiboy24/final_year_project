require('dotenv').config();
const express = require('express');
const cors = require('cors');

const studentRoutes = require('./routes/student.routes');
const courseRoutes = require('./routes/course.routes');
const attendanceRoutes = require('./routes/attendance.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'student-service' });
});

app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/attendance', attendanceRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    if (statusCode >= 500 || process.env.NODE_ENV === 'development') {
        process.stdout.write(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${err.message}\n`);
    }
    res.status(statusCode).json({ error: { message: err.message || 'Internal Server Error' } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Student Service running on port ${PORT}`);
});
