-- Performance indexes for hot query paths.
-- Safe to re-run: each statement uses IF NOT EXISTS (MySQL 8+) or a guard procedure.

DELIMITER $$

DROP PROCEDURE IF EXISTS add_index_if_missing$$
CREATE PROCEDURE add_index_if_missing(
    IN p_table VARCHAR(128),
    IN p_index VARCHAR(128),
    IN p_cols  VARCHAR(512)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name   = p_table
          AND index_name   = p_index
    ) THEN
        SET @sql = CONCAT('CREATE INDEX ', p_index, ' ON ', p_table, ' (', p_cols, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- Results: report/dashboard hot path (filter by user + exam, sort by date, sum on passed)
CALL add_index_if_missing('results', 'idx_results_user_completed',    'user_id, completed_at');
CALL add_index_if_missing('results', 'idx_results_exam_completed',    'exam_id, completed_at');
CALL add_index_if_missing('results', 'idx_results_exam_passed',       'exam_id, passed');

-- Exam access / canStartExam / retake lookups
CALL add_index_if_missing('retake_requests', 'idx_retake_user_exam_status', 'user_id, exam_id, status');

-- Batch membership lookups (getAvailableTests, getUserProfile)
CALL add_index_if_missing('batch_members',    'idx_batch_members_user',     'user_id, batch_id');
CALL add_index_if_missing('batch_teams',      'idx_batch_teams_team',       'team_id, batch_id');

-- Batches filtering by date / exam
CALL add_index_if_missing('batches',          'idx_batches_exam_active',    'exam_id, is_active');
CALL add_index_if_missing('batches',          'idx_batches_end_date',       'end_date');

-- Exams listing filters
CALL add_index_if_missing('exams',            'idx_exams_active_created',   'is_active, created_at');
CALL add_index_if_missing('exams',            'idx_exams_created_by',       'created_by_id');

-- Users lookups
CALL add_index_if_missing('users',            'idx_users_team_active',      'team_id, is_active');

DROP PROCEDURE add_index_if_missing;
