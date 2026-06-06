import { readFileSync } from 'fs'
import { join } from 'path'
import sql from '@/lib/db'

async function runMigrations() {
    try {
        console.log('Running migrations...')
        
        // Test connection first
        await sql.query('SELECT 1')
        console.log('✓ Database connection verified')
        
        // Run main migration
        const mainMigration = readFileSync(join(process.cwd(), 'src/lib/migration-mysql.sql'), 'utf-8')
        await sql.unsafe(mainMigration)
        console.log('✓ Main migration complete')
        
        // Run exam progress migration
        const examProgressMigration = readFileSync(join(process.cwd(), 'src/lib/migrations/create_exam_progress.sql'), 'utf-8')
        await sql.unsafe(examProgressMigration)
        console.log('✓ Exam progress migration complete')
        
        // Run attempts table migration
        const attemptsMigration = readFileSync(join(process.cwd(), 'src/lib/migrations/add_attempts_table.sql'), 'utf-8')
        await sql.unsafe(attemptsMigration)
        console.log('✓ Attempts table migration complete')
        
        console.log('✓ All migrations completed successfully')
        
    } catch (error: unknown) {
        console.error('Migration failed:', {
            message: error instanceof Error ? error.message : String(error),
            code: (error as { code?: string })?.code,
            errno: (error as { errno?: number })?.errno
        })
        
        // Provide specific error guidance
        if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
            console.error('[migrate] Network error - check database host and connectivity')
        } else if (error instanceof Error && (error.message.includes('access denied') || error.message.includes('authentication'))) {
            console.error('[migrate] Authentication error - check credentials')
        } else if (error instanceof Error && error.message.includes('already exists')) {
            console.warn('[migrate] Some tables may already exist - this is usually safe')
        } else if (error instanceof Error && (error.message.includes('syntax') || error.message.includes('SQL'))) {
            console.error('[migrate] SQL syntax error - check migration files')
        }
        
        process.exit(1)
    }
}

// Run if called directly
if (require.main === module) {
    runMigrations()
}

export { runMigrations }
