import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import { withRetry } from '@/lib/db'
import UserForm from '../user-form'

async function getTeams() {
    try {
        return await withRetry(() => sql.query('SELECT id, name, unit FROM teams ORDER BY name'))
    } catch { return [] }
}

export default async function CreateUserPage() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard')
    const teams = await getTeams()
    return (
        <div>
            <div className="page-header">Create New User</div>
            <UserForm teams={teams as any[]} />
        </div>
    )
}
