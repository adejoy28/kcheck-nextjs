import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, {
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 60, // Increased for Neon cold starts
    connection: {
        application_name: 'kcheck',
    },
    onnotice: () => {},
})

// Enhanced connection test with detailed error reporting
async function testConnection() {
    try {
        await sql`SELECT 1`
        console.log('[db] Database connection successful')
        return true
    } catch (error: any) {
        console.error('[db] Connection failed:', {
            message: error.message,
            code: error.code,
            severity: error.severity
        })
        
        // Provide specific guidance for common errors
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            console.error('[db] Network error - check database host and connectivity')
        } else if (error.message.includes('access denied') || error.message.includes('authentication')) {
            console.error('[db] Authentication error - check credentials')
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
            console.error('[db] Database does not exist - create the database first')
        }
        
        return false
    }
}

// Test connection on startup
testConnection().then(isConnected => {
    if (!isConnected) {
        console.warn('[db] Application will continue but database operations may fail')
    }
})

export default sql
export { testConnection }
