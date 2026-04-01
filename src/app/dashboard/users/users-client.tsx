'use client'

import { useState } from 'react'
import Link from 'next/link'
import { showToast } from '@/ui/dashboard/toast'
import { DataTable, Action } from '@/components/ui/DataTable'

export default function UsersClient({ users: initial }: { users: any[] }) {
    const [users, setUsers] = useState(initial)
    const [search, setSearch] = useState('')

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.team_name || '').toLowerCase().includes(search.toLowerCase())
    )

    const getActions = (row: any): Action[] => [
        {
            label: 'Edit',
            onClick: () => {
                window.location.href = `/dashboard/users/${row.id}`
            },
            variant: 'primary'
        },
        {
            label: row.is_active ? 'Deactivate' : 'Activate',
            onClick: () => toggleActive(row.id),
            variant: 'default'
        }
    ]

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
            <DataTable
                columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'username', label: 'Username' },
                    { 
                        key: 'role', 
                        label: 'Role', 
                        render: (v) => (
                            <span className={`badge badge--${v === 'ADMIN' ? 'admin' : 'staff'}`}>
                                {v}
                            </span>
                        )
                    },
                    { key: 'team_name', label: 'Team', render: (v) => v || '—' },
                    { key: 'unit', label: 'Unit', render: (v) => v || '—' },
                    { key: 'tests_taken', label: 'Tests Taken' },
                    { 
                        key: 'is_active', 
                        label: 'Status', 
                        render: (v) => (
                            <span className={`badge badge--${v ? 'active' : 'expired'}`}>
                                {v ? 'Active' : 'Inactive'}
                            </span>
                        )
                    },
                ]}
                data={filtered}
                actions={getActions}
                emptyMessage="No users found."
            />
        </div>
    )
}
