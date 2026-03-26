import sql from '@/lib/db'

// Get all users
export async function getAllUsers() {
    try {
        const users = await sql`
            SELECT id, name, username, role, is_active, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `
        return users
    } catch (error) {
        console.error('[getAllUsers]', error)
        throw error
    }
}

// Get user by ID
export async function getUserById(id: string) {
    try {
        const [user] = await sql`
            SELECT id, name, username, role, is_active, created_at, updated_at
            FROM users
            WHERE id = ${id}
            LIMIT 1
        `
        return user || null
    } catch (error) {
        console.error('[getUserById]', error)
        throw error
    }
}

// Get user by username
export async function getUserByUsername(username: string) {
    try {
        const [user] = await sql`
            SELECT id, name, username, role, is_active, created_at, updated_at
            FROM users
            WHERE username = ${username.toLowerCase()}
            LIMIT 1
        `
        return user || null
    } catch (error) {
        console.error('[getUserByUsername]', error)
        throw error
    }
}

// Get active users only
export async function getActiveUsers() {
    try {
        const users = await sql`
            SELECT id, name, username, role, created_at, updated_at
            FROM users
            WHERE is_active = true
            ORDER BY created_at DESC
        `
        return users
    } catch (error) {
        console.error('[getActiveUsers]', error)
        throw error
    }
}

// Get users by role
export async function getUsersByRole(role: string) {
    try {
        const users = await sql`
            SELECT id, name, username, is_active, created_at, updated_at
            FROM users
            WHERE role = ${role}
            ORDER BY created_at DESC
        `
        return users
    } catch (error) {
        console.error('[getUsersByRole]', error)
        throw error
    }
}
