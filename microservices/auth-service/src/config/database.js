const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/sms_db',
});

/**
 * Executes a callback within a database transaction.
 * @param {Function} callback - A function that receives the database client.
 * @returns {Promise<any>} The result of the callback.
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  withTransaction,
  query: (text, params) => pool.query(text, params),
};
