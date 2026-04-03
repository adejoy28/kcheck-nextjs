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
    } catch (error: unknown) {
        console.error('[db] Connection failed:', {
            message: error instanceof Error ? error.message : String(error),
            code: (error as { code?: string })?.code,
            severity: (error as { severity?: string })?.severity
        })
        
        // Provide specific guidance for common errors
        if (error instanceof Error && (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED'))) {
            console.error('[db] Network error - check database host and connectivity')
        } else if (error instanceof Error && (error.message.includes('access denied') || error.message.includes('authentication'))) {
            console.error('[db] Authentication error - check credentials')
        } else if (error instanceof Error && error.message.includes('database') && error.message.includes('does not exist')) {
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

// Retry wrapper for database operations
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: unknown
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error: unknown) {
            lastError = error
            
            // Don't retry on certain errors
            if ((error as { code?: string })?.code === '23505' || // Unique violation
                (error as { code?: string })?.code === '23503' || // Foreign key violation
                (error as { code?: string })?.code === '42501') {  // Insufficient privileges
                throw error
            }
            
            if (attempt === maxRetries) {
                console.error(`[db] Operation failed after ${maxRetries} attempts:`, error)
                throw error
            }
            
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
            console.warn(`[db] Attempt ${attempt} failed, retrying in ${delay}ms:`, error instanceof Error ? error.message : String(error))
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    
    throw lastError
}
