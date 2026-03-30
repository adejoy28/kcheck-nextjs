import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import UsersClient from '@/app/dashboard/users/users-client'

async function getUsers() {
    try {
        return await withRetry(() => sql`
            SELECT
                u.id, u.name, u.username, u.role, u.is_active,
                u.phone, u.unit, u.access_group, u.created_at,
                t.name AS team_name,
                COUNT(DISTINCT r.id) AS tests_taken
            FROM users u
            LEFT JOIN teams t ON u.team_id = t.id
            LEFT JOIN results r ON r.user_id = u.id
            GROUP BY u.id, t.name
            ORDER BY u.created_at DESC
        `)
    } catch (error) {
        console.error('[getUsers]', error)
        return []
    }
}

export default async function UsersPage() {
    await requireAdmin()
    const users = await getUsers()
    return <UsersClient users={users as any[]} />
}
