const { query, withTransaction } = require('../config/database');

class CourseService {
  async createCourse(code, title, credits) {
    const result = await query(
      'INSERT INTO courses (code, title, credits) VALUES ($1, $2, $3) RETURNING *',
      [code, title, credits]
    );
    return result.rows[0];
  }

  async getAllCourses() {
    const result = await query('SELECT * FROM courses');
    return result.rows;
  }

  async enrollStudent(studentId, courseCode) {
    // We execute this in a transaction to ensure course exists and student is registered
    return await withTransaction(async (client) => {
      // Get course ID
      const courseRes = await client.query('SELECT id FROM courses WHERE code = $1', [courseCode]);
      if (courseRes.rows.length === 0) {
        throw new Error('Course not found');
      }
      const courseId = courseRes.rows[0].id;

      // Enroll
      try {
        const enrollRes = await client.query(
          'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
          [studentId, courseId]
        );
        return enrollRes.rows[0];
      } catch (err) {
        if (err.code === '23505') { // Postgres unique violation error code
          throw new Error('Already enrolled in this course');
        }
        throw err;
      }
    });
  }

  async getStudentEnrollments(studentId) {
    const queryStr = `
      SELECT c.*, e.created_at as enrolled_at 
      FROM courses c 
      JOIN enrollments e ON c.id = e.course_id 
      WHERE e.student_id = $1
    `;
    const result = await query(queryStr, [studentId]);
    return result.rows;
  }
}

module.exports = new CourseService();
