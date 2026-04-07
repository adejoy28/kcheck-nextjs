import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { 
    ssl: 'require',
    connect_timeout: 30
})

async function freshMigrate() {
    try {
        console.log('Starting fresh migration...')
        
        // Test connection first
        await sql`SELECT 1`
        console.log('✓ Database connection verified')
        
        // Drop all tables in correct order (respecting foreign key constraints)
        console.log('Dropping existing tables...')
        
        await sql`DROP TABLE IF EXISTS exam_progress CASCADE`
        await sql`DROP TABLE IF EXISTS retake_requests CASCADE`
        await sql`DROP TABLE IF EXISTS results CASCADE`
        await sql`DROP TABLE IF EXISTS batch_teams CASCADE`
        await sql`DROP TABLE IF EXISTS batch_members CASCADE`
        await sql`DROP TABLE IF EXISTS batches CASCADE`
        await sql`DROP TABLE IF EXISTS questions CASCADE`
        await sql`DROP TABLE IF EXISTS exams CASCADE`
        await sql`DROP TABLE IF EXISTS users CASCADE`
        await sql`DROP TABLE IF EXISTS categories CASCADE`
        await sql`DROP TABLE IF EXISTS teams CASCADE`
        
        console.log('✓ All tables dropped')
        
        // Now run the migration
        console.log('Creating fresh tables...')
        
        // Teams
        await sql`
            CREATE TABLE teams (
                id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                name        TEXT NOT NULL UNIQUE,
                unit        TEXT,
                created_at  TIMESTAMP DEFAULT NOW(),
                updated_at  TIMESTAMP DEFAULT NOW()
            )
        `
        
        // Categories
        await sql`
            CREATE TABLE categories (
                id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                name       TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `
        
        // Users
        await sql`
            CREATE TABLE users (
                id           TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                name         TEXT NOT NULL,
                username     TEXT NOT NULL UNIQUE,
                password     TEXT NOT NULL,
                role         TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('STAFF', 'ADMIN')),
                is_active    BOOLEAN NOT NULL DEFAULT TRUE,
                phone        TEXT,
                unit         TEXT,
                access_group TEXT,
                team_id      TEXT REFERENCES teams(id) ON DELETE SET NULL,
                created_at   TIMESTAMP DEFAULT NOW(),
                updated_at   TIMESTAMP DEFAULT NOW()
            )
        `
        
        // Exams
        await sql`
            CREATE TABLE exams (
                id             TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                title          TEXT NOT NULL,
                description    TEXT,
                duration       INTEGER NOT NULL,
                passing_score  INTEGER NOT NULL DEFAULT 50,
                is_active      BOOLEAN NOT NULL DEFAULT TRUE,
                retake_allowed BOOLEAN NOT NULL DEFAULT FALSE,
                category_id    TEXT REFERENCES categories(id) ON DELETE SET NULL,
                created_by_id  TEXT NOT NULL REFERENCES users(id),
                created_at     TIMESTAMP DEFAULT NOW(),
                updated_at     TIMESTAMP DEFAULT NOW()
            )
        `
        
        // Questions
        await sql`
            CREATE TABLE questions (
                id             TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                text           TEXT NOT NULL,
                options        TEXT[] NOT NULL,
                correct_answer INTEGER NOT NULL,
                weight         INTEGER NOT NULL DEFAULT 1,
                exam_id        TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                created_at     TIMESTAMP DEFAULT NOW(),
                updated_at     TIMESTAMP DEFAULT NOW()
            )
        `
        
        // Batches
        await sql`
            CREATE TABLE batches (
                id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                name       TEXT NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date   TIMESTAMP NOT NULL,
                is_active  BOOLEAN NOT NULL DEFAULT TRUE,
                exam_id    TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `
        
        // Batch members
        await sql`
            CREATE TABLE batch_members (
                id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                batch_id   TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
                user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(batch_id, user_id)
            )
        `
        
        // Batch teams
        await sql`
            CREATE TABLE batch_teams (
                id       TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
                team_id  TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
                UNIQUE(batch_id, team_id)
            )
        `
        
        // Results
        await sql`
            CREATE TABLE results (
                id              TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                score           INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                percentage      FLOAT NOT NULL,
                passed          BOOLEAN NOT NULL,
                time_taken      INTEGER NOT NULL,
                answers         JSONB NOT NULL,
                user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                exam_id         TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                completed_at    TIMESTAMP DEFAULT NOW(),
                created_at      TIMESTAMP DEFAULT NOW(),
                updated_at      TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, exam_id)
            )
        `
        
        // Retake requests
        await sql`
            CREATE TABLE retake_requests (
                id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                exam_id       TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                granted_by_id TEXT NOT NULL REFERENCES users(id),
                created_at    TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, exam_id)
            )
        `
        
        // Exam progress
        await sql`
            CREATE TABLE exam_progress (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                exam_id VARCHAR(255) NOT NULL,
                current_question_index INTEGER DEFAULT 0,
                answers JSONB NOT NULL DEFAULT '[]'::jsonb,
                time_left INTEGER NOT NULL,
                start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                is_completed BOOLEAN DEFAULT FALSE,
                
                UNIQUE(user_id, exam_id),
                
                CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT fk_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
            )
        `
        
        // Create indexes
        await sql`CREATE INDEX idx_exam_progress_user_exam ON exam_progress(user_id, exam_id)`
        await sql`CREATE INDEX idx_exam_progress_last_updated ON exam_progress(last_updated)`
        
        console.log('✓ Fresh migration complete — all tables created')
        
    } catch (error: unknown) {
        console.error('Fresh migration failed:', {
            message: error instanceof Error ? error.message : String(error),
            code: (error as { code?: string })?.code,
            severity: (error as { severity?: string })?.severity
        })
        
        // Provide specific error guidance
        if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
            console.error('[fresh-migrate] Network error - check database host and connectivity')
        } else if (error instanceof Error && (error.message.includes('access denied') || error.message.includes('authentication'))) {
            console.error('[fresh-migrate] Authentication error - check credentials')
        } else if (error instanceof Error && (error.message.includes('syntax') || error.message.includes('SQL'))) {
            console.error('[fresh-migrate] SQL syntax error')
        }
        
        process.exit(1)
    } finally {
        await sql.end()
    }
}

freshMigrate()
