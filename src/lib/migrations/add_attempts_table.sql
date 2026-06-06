-- Exam attempts table
CREATE TABLE IF NOT EXISTS exam_attempts (
    id            VARCHAR(36)   NOT NULL PRIMARY KEY DEFAULT (UUID()),
    exam_id       VARCHAR(36)   NOT NULL,
    user_id       VARCHAR(36)   NOT NULL,
    status        ENUM('in_progress','submitted','timed_out') NOT NULL DEFAULT 'in_progress',
    question_ids  JSON          NULL,          -- ordered question IDs for this attempt
    started_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time      DATETIME      NOT NULL,      -- started_at + exam.duration minutes
    submitted_at  DATETIME      NULL,
    time_taken    INT           NULL,          -- seconds
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_attempts_user  (user_id),
    INDEX idx_attempts_exam  (exam_id),
    INDEX idx_attempts_status (status)
);

-- Per-answer saves for an attempt
CREATE TABLE IF NOT EXISTS attempt_answers (
    id           VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    attempt_id   VARCHAR(36) NOT NULL,
    question_id  VARCHAR(36) NOT NULL,
    answer_index INT         NULL,
    saved_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_attempt_question (attempt_id, question_id),
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
);

-- Multi-tab session control
CREATE TABLE IF NOT EXISTS exam_sessions (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY DEFAULT (UUID()),
    attempt_id   VARCHAR(36)  NOT NULL UNIQUE,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_ping    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
);

-- Performance index on exams table (add if missing)
ALTER TABLE exams ADD INDEX IF NOT EXISTS idx_exams_active (is_active);
ALTER TABLE questions ADD INDEX IF NOT EXISTS idx_questions_exam (exam_id);
