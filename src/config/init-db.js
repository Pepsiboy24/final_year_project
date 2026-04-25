const { pool } = require('./database');

const createTables = async () => {
  const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('teacher', 'student')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      reg_number VARCHAR(100) UNIQUE NOT NULL,
      level INTEGER NOT NULL,
      department VARCHAR(255) NOT NULL,
      cumulative_gpa NUMERIC(3, 2) DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      credits INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id, date)
    );

    CREATE TABLE IF NOT EXISTS grades (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      score NUMERIC(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
      grade_point NUMERIC(3, 2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id)
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables', error);
  } finally {
    pool.end();
  }
};

if (require.main === module) {
  createTables();
}

module.exports = { createTables };
