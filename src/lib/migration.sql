CREATE TABLE IF NOT EXISTS teams (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    unit        TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
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
);

CREATE TABLE IF NOT EXISTS categories (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
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
);

CREATE TABLE IF NOT EXISTS questions (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    text           TEXT NOT NULL,
    options        TEXT[] NOT NULL,
    correct_answer INTEGER NOT NULL,
    weight         INTEGER NOT NULL DEFAULT 1,
    exam_id        TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date   TIMESTAMP NOT NULL,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    exam_id    TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_members (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id   TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(batch_id, user_id)
);

CREATE TABLE IF NOT EXISTS batch_teams (
    id       TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    team_id  TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE(batch_id, team_id)
);

CREATE TABLE IF NOT EXISTS results (
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
);

CREATE TABLE IF NOT EXISTS retake_requests (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id       TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    granted_by_id TEXT NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, exam_id)
);

CREATE TABLE IF NOT EXISTS exam_progress (
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
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exam_progress_user_exam ON exam_progress(user_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_progress_last_updated ON exam_progress(last_updated);
