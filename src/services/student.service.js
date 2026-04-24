const { query } = require('../config/database');

class StudentService {
  async createProfile(userId, regNumber, level, department) {
    const checkQuery = 'SELECT id FROM students WHERE id = $1 OR reg_number = $2';
    const checkResult = await query(checkQuery, [userId, regNumber]);
    if (checkResult.rows.length > 0) {
      throw new Error('Profile already exists or registration number is taken');
    }

    const insertQuery = `
      INSERT INTO students (id, reg_number, level, department)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await query(insertQuery, [userId, regNumber, level, department]);
    return result.rows[0];
  }

  async getProfile(userId) {
    const result = await query('SELECT * FROM students WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      throw new Error('Student profile not found');
    }
    return result.rows[0];
  }

  async updateProfile(userId, updates) {
    const allowedUpdates = ['level', 'department'];
    const setClause = [];
    const values = [userId];
    let queryIndex = 2;

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        setClause.push(`${key} = $${queryIndex}`);
        values.push(updates[key]);
        queryIndex++;
      }
    }

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    const updateQuery = `
      UPDATE students 
      SET ${setClause.join(', ')} 
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(updateQuery, values);
    if (result.rows.length === 0) {
      throw new Error('Student profile not found');
    }
    return result.rows[0];
  }
}

module.exports = new StudentService();
