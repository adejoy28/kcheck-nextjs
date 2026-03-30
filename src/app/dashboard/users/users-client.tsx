'use client'

import { useState } from 'react'
import Link from 'next/link'
import { showToast } from '@/ui/dashboard/toast'

export default function UsersClient({ users: initial }: { users: any[] }) {
    const [users, setUsers] = useState(initial)
    const [search, setSearch] = useState('')

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.team_name || '').toLowerCase().includes(search.toLowerCase())
    )

    async function toggleActive(id: string) {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'PATCH' })
            const data = await res.json()
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: data.is_active } : u))
                showToast(`User ${data.is_active ? 'activated' : 'deactivated'}`, 'success')
            } else {
                showToast(data.message, 'error')
            }
        } catch { showToast('Failed to update user', 'error') }
    }

    return (
        <div>
            <div className="page-header">Users Management</div>
            <div className="section-hdr">
                <span className="section-title">All Users ({users.length})</span>
                <Link href="/dashboard/users/create" className="btn btn--primary btn--sm">+ Add User</Link>
            </div>
            <div className="toolbar-row">
                <input
                    type="text"
                    className="admin-search"
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <span className="pag-info">{filtered.length} results</span>
            </div>
            <div className="table__wrap" style={{ overflowX: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table__header">Name</th>
                            <th className="table__header">Username</th>
                            <th className="table__header">Role</th>
                            <th className="table__header">Team</th>
                            <th className="table__header">Unit</th>
                            <th className="table__header">Tests Taken</th>
                            <th className="table__header">Status</th>
                            <th className="table__header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} className="table__empty">No users found.</td></tr>
                        ) : filtered.map(user => (
                            <tr key={user.id} className="table__row">
                                <td className="table__cell table__cell--bold">{user.name}</td>
                                <td className="table__cell">{user.username}</td>
                                <td className="table__cell">
                                    <span className={`badge badge--${user.role === 'ADMIN' ? 'admin' : 'staff'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="table__cell table__cell--muted">{user.team_name || '—'}</td>
                                <td className="table__cell table__cell--muted">{user.unit || '—'}</td>
                                <td className="table__cell">{user.tests_taken}</td>
                                <td className="table__cell">
                                    <span className={`badge badge--${user.is_active ? 'active' : 'expired'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="table__cell">
                                    <div className="admin-actions">
                                        <Link href={`/dashboard/users/${user.id}`} className="admin-action-btn admin-action-btn--edit">Edit</Link>
                                        <button onClick={() => toggleActive(user.id)} className="admin-action-btn admin-action-btn--toggle">
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
