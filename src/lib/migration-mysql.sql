CREATE TABLE IF NOT EXISTS teams (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name        VARCHAR(255) NOT NULL UNIQUE,
    unit        VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id           CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name         VARCHAR(255) NOT NULL,
    username     VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         VARCHAR(50) NOT NULL DEFAULT 'STAFF' CHECK (role IN ('STAFF', 'ADMIN')),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    phone        VARCHAR(50),
    unit         VARCHAR(255),
    access_group VARCHAR(255),
    team_id      CHAR(36),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name       VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exams (
    id             CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    duration       INTEGER NOT NULL,
    passing_score  INTEGER NOT NULL DEFAULT 50,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    retake_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    category_id    CHAR(36),
    created_by_id  CHAR(36) NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions (
    id             CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    text           TEXT NOT NULL,
    options        JSON NOT NULL,
    correct_answer INTEGER NOT NULL,
    weight         INTEGER NOT NULL DEFAULT 1,
    exam_id        CHAR(36) NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS batches (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name       VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    exam_id    CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

CREATE TABLE IF NOT EXISTS batch_members (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    batch_id   CHAR(36) NOT NULL,
    user_id    CHAR(36) NOT NULL,
    UNIQUE(batch_id, user_id),
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS batch_teams (
    id       CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    batch_id CHAR(36) NOT NULL,
    team_id  CHAR(36) NOT NULL,
    UNIQUE(batch_id, team_id),
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS results (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id         CHAR(36) NOT NULL,
    exam_id         CHAR(36) NOT NULL,
    score           INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage      INTEGER NOT NULL,
    passed          BOOLEAN NOT NULL,
    time_taken      INTEGER NOT NULL,
    answers         JSON,
    completed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS retake_requests (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id       CHAR(36) NOT NULL,
    exam_id       CHAR(36) NOT NULL,
    reason        TEXT,
    status        VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    requested_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at   TIMESTAMP,
    reviewed_by   CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS exam_progress (
    id                    CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id               CHAR(36) NOT NULL,
    exam_id               CHAR(36) NOT NULL,
    current_question_index INTEGER DEFAULT 0,
    answers               JSON,
    time_left             INTEGER,
    start_time            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_completed          BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, exam_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);
