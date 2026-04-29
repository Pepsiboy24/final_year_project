require('dotenv').config();
const express = require('express');
const cors = require('cors');

const resultRoutes = require('./routes/result.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'result-service' });
});

app.use('/api/v1/results', resultRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    if (statusCode >= 500 || process.env.NODE_ENV === 'development') {
        process.stdout.write(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${err.message}\n`);
    }
    res.status(statusCode).json({ error: { message: err.message || 'Internal Server Error' } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Result Service running on port ${PORT}`);
});
