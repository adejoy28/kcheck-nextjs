-- Add missing columns to retake_requests table
-- The table was originally created with the PostgreSQL schema which lacks
-- the status, reason, requested_at, reviewed_at, and reviewed_by columns.

DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_missing$$
CREATE PROCEDURE add_column_if_missing(
    IN p_table VARCHAR(128),
    IN p_column VARCHAR(128),
    IN p_def VARCHAR(512)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name   = p_table
          AND column_name  = p_column
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table, ' ADD COLUMN ', p_column, ' ', p_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

CALL add_column_if_missing('retake_requests', 'status',       "VARCHAR(50) DEFAULT 'PENDING'");
CALL add_column_if_missing('retake_requests', 'reason',       'TEXT');
CALL add_column_if_missing('retake_requests', 'requested_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
CALL add_column_if_missing('retake_requests', 'reviewed_at',  'TIMESTAMP NULL');
CALL add_column_if_missing('retake_requests', 'reviewed_by',  'CHAR(36)');

DROP PROCEDURE add_column_if_missing;
