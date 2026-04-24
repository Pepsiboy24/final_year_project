const { query } = require('../config/database');

class AttendanceService {
  async logAttendance(studentId, courseCode, status, date) {
    // First get course_id
    const courseRes = await query('SELECT id FROM courses WHERE code = $1', [courseCode]);
    if (courseRes.rows.length === 0) {
      throw new Error('Course not found');
    }
    const courseId = courseRes.rows[0].id;

    try {
      const q = date ? 
        'INSERT INTO attendance (student_id, course_id, status, date) VALUES ($1, $2, $3, $4) RETURNING *' :
        'INSERT INTO attendance (student_id, course_id, status) VALUES ($1, $2, $3) RETURNING *';
      
      const values = date ? [studentId, courseId, status, date] : [studentId, courseId, status];
      
      const result = await query(q, values);
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('Attendance already logged for this student and course on this date');
      }
      throw err;
    }
  }

  async getAttendanceRecords(courseCode, date) {
    let q = `
      SELECT a.*, s.reg_number 
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN courses c ON a.course_id = c.id
      WHERE c.code = $1
    `;
    const params = [courseCode];
    if (date) {
      q += ' AND a.date = $2';
      params.push(date);
    }
    const result = await query(q, params);
    return result.rows;
  }
}

module.exports = new AttendanceService();
