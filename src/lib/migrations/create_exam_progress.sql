-- Create exam_progress table for tracking in-progress exams
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

-- Clean up old incomplete progress (older than 24 hours)
-- This can be run as a scheduled job
DELETE FROM exam_progress 
WHERE is_completed = FALSE 
AND last_updated < NOW() - INTERVAL '24 hours';
