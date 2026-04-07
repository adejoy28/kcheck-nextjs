-- Test the exam progress system
-- Run this script to verify the table was created correctly

-- Check if table exists
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'exam_progress'
ORDER BY ordinal_position;

-- Test inserting sample progress (first time)
INSERT INTO exam_progress (
    user_id, 
    exam_id, 
    current_question_index, 
    answers, 
    time_left
) VALUES (
    'test-user-123',
    'test-exam-456',
    2,
    '[0, 1, null, null]',
    1800
);

-- Test retrieving progress
SELECT * FROM exam_progress 
WHERE user_id = 'test-user-123' AND exam_id = 'test-exam-456';

-- Test updating progress
UPDATE exam_progress 
SET current_question_index = 3,
    answers = '[0, 1, 2, null]',
    time_left = 1500,
    last_updated = NOW()
WHERE user_id = 'test-user-123' AND exam_id = 'test-exam-456';

-- Clean up test data
DELETE FROM exam_progress 
WHERE user_id = 'test-user-123' AND exam_id = 'test-exam-456';
