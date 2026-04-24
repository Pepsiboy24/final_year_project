const { pool } = require('./src/config/database');

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as time');
    console.log('Database connected successfully. Current DB time:', res.rows[0].time);
  } catch (err) {
    console.error('Error connecting to the database:', err.stack);
  } finally {
    await pool.end();
  }
}

testConnection();
