'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/ui/dashboard/toast'

interface Props {
    teams: { id: string; name: string; unit: string }[]
    user?: any
}

export default function UserForm({ teams, user }: Props) {
    const router = useRouter()
    const isEdit = !!user

    const [name, setName] = useState(user?.name || '')
    const [username, setUsername] = useState(user?.username || '')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState(user?.role || 'STAFF')
    const [phone, setPhone] = useState(user?.phone || '')
    const [teamId, setTeamId] = useState(user?.team_id || '')
    const [unit, setUnit] = useState(user?.unit || '')
    const [accessGroup, setAccessGroup] = useState(user?.access_group || '')
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) { showToast('Name is required', 'error'); return }
        if (!username.trim()) { showToast('Username is required', 'error'); return }
        if (!isEdit && !password) { showToast('Password is required', 'error'); return }
        if (password && password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return }

        setSaving(true)
        try {
            const body = { name, username, password: password || undefined, role, phone, team_id: teamId || null, unit, access_group: accessGroup }
            const url = isEdit ? `/api/users/${user.id}` : '/api/users'
            const method = isEdit ? 'PUT' : 'POST'
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            const data = await res.json()
            if (res.ok) {
                showToast(isEdit ? 'User updated' : 'User created', 'success')
                router.push('/dashboard/users')
            } else {
                showToast(data.message, 'error')
            }
        } catch { showToast('Failed to save user', 'error') }
        setSaving(false)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="exam-creation-container">
                <div className="exam-details-section">
                    <h3>User Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Username *</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} disabled={isEdit} required={!isEdit} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!isEdit} minLength={6} />
                        </div>
                        <div className="form-group">
                            <label>Role *</label>
                            <select value={role} onChange={e => setRole(e.target.value)} className="admin-select">
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Phone</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Team</label>
                            <select value={teamId} onChange={e => setTeamId(e.target.value)} className="admin-select">
                                <option value="">No team</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Unit</label>
                            <input type="text" value={unit} onChange={e => setUnit(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Access Group</label>
                            <input type="text" value={accessGroup} onChange={e => setAccessGroup(e.target.value)} placeholder="e.g. Team Member" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => router.push('/dashboard/users')}>Cancel</button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
                    {saving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                </button>
            </div>
        </form>
    )
}
