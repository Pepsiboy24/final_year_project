require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const courseRoutes = require('./routes/course.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const resultRoutes = require('./routes/result.routes');

const app = express();

// Middleware
app.use(cors());
// express.json() for parsing incoming payload
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', architecture: 'monolith' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/results', resultRoutes);

// Global Error Handling Middleware
// Optimized for high-concurrency: minimal logging to prevent event loop blocking. 
// Uses process.stdout.write directly for faster output under heavy load if logging is necessary.
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    // Log only 500+ errors under high load to avoid I/O bottlenecks 
    // unless we are in development mode.
    if (statusCode >= 500 || process.env.NODE_ENV === 'development') {
        const errorLog = `[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${err.message}\n`;
        process.stdout.write(errorLog);
    }

    res.status(statusCode).json({
        error: {
            message: err.message || 'Internal Server Error'
        }
    });
});

// Server Startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Monolith SMS Server running on port ${PORT}`);
});
