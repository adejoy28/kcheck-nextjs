import 'dotenv/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { 
    ssl: 'require',
    connect_timeout: 30
})

async function migrate() {
    try {
        console.log('Running migration...')
        
        // Test connection first
        await sql`SELECT 1`
        console.log('✓ Database connection verified')
        
        const migration = readFileSync(join(process.cwd(), 'src/lib/migration.sql'), 'utf-8')
        await sql.unsafe(migration)
        console.log('✓ Migration complete — all tables created')
        
    } catch (error: any) {
        console.error('Migration failed:', {
            message: error.message,
            code: error.code,
            severity: error.severity
        })
        
        // Provide specific error guidance
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            console.error('[migrate] Network error - check database host and connectivity')
        } else if (error.message.includes('access denied') || error.message.includes('authentication')) {
            console.error('[migrate] Authentication error - check credentials')
        } else if (error.message.includes('already exists')) {
            console.warn('[migrate] Some tables may already exist - this is usually safe')
        } else if (error.message.includes('syntax') || error.message.includes('SQL')) {
            console.error('[migrate] SQL syntax error - check migration.sql')
        }
        
        process.exit(1)
    } finally {
        await sql.end()
    }
}

migrate()
