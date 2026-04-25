const { query, withTransaction } = require('../config/database');

class ResultService {
    static calculateGradePoint(score) {
        if (score >= 70) return 5.0;
        if (score >= 60) return 4.0;
        if (score >= 50) return 3.0;
        if (score >= 45) return 2.0;
        if (score >= 40) return 1.0;
        return 0.0;
    }

    static async enterGrade(studentId, courseId, score) {
        const gradePoint = this.calculateGradePoint(score);

        return withTransaction(async (client) => {
            // Upsert grade
            const insertGradeText = `
                INSERT INTO grades (student_id, course_id, score, grade_point)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (student_id, course_id) 
                DO UPDATE SET score = EXCLUDED.score, grade_point = EXCLUDED.grade_point
                RETURNING *;
            `;
            const gradeRes = await client.query(insertGradeText, [studentId, courseId, score, gradePoint]);

            // Update student CGPA (high concurrency efficient: update only if changed or using a single query)
            const updateCgpaText = `
                WITH student_grades AS (
                    SELECT g.grade_point, c.credits
                    FROM grades g
                    JOIN courses c ON g.course_id = c.id
                    WHERE g.student_id = $1
                )
                UPDATE students
                SET cumulative_gpa = (
                    SELECT COALESCE(SUM(grade_point * credits) / NULLIF(SUM(credits), 0), 0.00)
                    FROM student_grades
                )
                WHERE id = $1
            `;
            await client.query(updateCgpaText, [studentId]);
            
            return gradeRes.rows[0];
        });
    }

    static async getStudentResults(studentId) {
        const resultsQuery = `
            SELECT g.score, g.grade_point, c.code AS course_code, c.title AS course_title, c.credits
            FROM grades g
            JOIN courses c ON g.course_id = c.id
            WHERE g.student_id = $1
        `;
        const { rows: results } = await query(resultsQuery, [studentId]);
        
        const studentQuery = `SELECT cumulative_gpa FROM students WHERE id = $1`;
        const { rows: studentRows } = await query(studentQuery, [studentId]);
        
        return {
            results,
            cgpa: studentRows.length > 0 ? studentRows[0].cumulative_gpa : 0.00
        };
    }
}

module.exports = ResultService;
