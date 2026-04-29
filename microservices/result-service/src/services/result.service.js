const { query, withTransaction } = require('../config/database');
const httpClient = require('../utils/httpClient');
const STUDENT_SERVICE_URL = process.env.STUDENT_SERVICE_URL || 'http://student-service:3000';
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
            
            // Get all grades for student
            const allGradesRes = await client.query('SELECT course_id, grade_point FROM grades WHERE student_id = $1', [studentId]);
            const grades = allGradesRes.rows;

            // Fetch course credits from student-service
            let totalCredits = 0;
            let totalPoints = 0;
            for (const g of grades) {
                // Inter-service call with resilience
                const courseRes = await httpClient.get(`${STUDENT_SERVICE_URL}/api/v1/courses/${g.course_id}`);
                const credits = courseRes.data.course.credits;
                totalCredits += credits;
                totalPoints += g.grade_point * credits;
            }

            const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

            // Inter-service call to update CGPA
            await httpClient.patch(`${STUDENT_SERVICE_URL}/api/v1/students/${studentId}/cgpa`, {
                cgpa: parseFloat(cgpa)
            });
            
            return gradeRes.rows[0];
        });
    }

    static async getStudentResults(studentId) {
        const resultsQuery = `
            SELECT score, grade_point, course_id
            FROM grades
            WHERE student_id = $1
        `;
        const { rows: results } = await query(resultsQuery, [studentId]);
        
        // Enhance with course details from student-service
        const enhancedResults = [];
        for (const r of results) {
            try {
                const courseRes = await httpClient.get(`${STUDENT_SERVICE_URL}/api/v1/courses/${r.course_id}`);
                const c = courseRes.data.course;
                enhancedResults.push({
                    score: r.score,
                    grade_point: r.grade_point,
                    course_code: c.code,
                    course_title: c.title,
                    credits: c.credits
                });
            } catch (err) {
                // Ignore failures to fetch course details, just return basic info
                enhancedResults.push({
                    score: r.score,
                    grade_point: r.grade_point,
                    course_code: 'UNKNOWN',
                    course_title: 'UNKNOWN',
                    credits: 0
                });
            }
        }

        // Get CGPA from student service
        let cgpa = 0.00;
        try {
            const studentRes = await httpClient.get(`${STUDENT_SERVICE_URL}/api/v1/students/${studentId}`);
            cgpa = studentRes.data.student.cumulative_gpa;
        } catch (err) {
            console.error('Failed to get student CGPA', err.message);
        }
        
        return {
            results: enhancedResults,
            cgpa: cgpa
        };
    }
}

module.exports = ResultService;
