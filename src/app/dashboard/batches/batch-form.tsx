'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
    exams: any[]
    teams: any[]
    users: any[]
    batch?: any
}

export default function BatchForm({ exams, teams, users, batch }: Props) {
    const router = useRouter()
    const isEdit = !!batch

    const [name, setName] = useState(batch?.name || '')
    const [examId, setExamId] = useState(batch?.exam_id || '')
    const [startDate, setStartDate] = useState(batch?.start_date ? new Date(batch.start_date).toISOString().slice(0, 16) : '')
    const [endDate, setEndDate] = useState(batch?.end_date ? new Date(batch.end_date).toISOString().slice(0, 16) : '')
    const [isActive, setIsActive] = useState(batch?.is_active ?? true)
    const [selectedTeams, setSelectedTeams] = useState<string[]>(batch?.teams?.map((t: any) => t.id) || [])
    const [selectedUsers, setSelectedUsers] = useState<string[]>(batch?.members?.map((m: any) => m.id) || [])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    function toggleTeam(id: string) {
        setSelectedTeams(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
    }

    function toggleUser(id: string) {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id])
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) { return }
        if (!examId) { return }
        if (!startDate || !endDate) { return }
        if (new Date(endDate) <= new Date(startDate)) { return }
        if (selectedTeams.length === 0 && selectedUsers.length === 0) {
            return
        }

        setSaving(true)
        setError('')
        try {
            const body = { name, exam_id: examId, start_date: startDate, end_date: endDate, is_active: isActive, team_ids: selectedTeams, user_ids: selectedUsers }
            const url = isEdit ? `/api/batches/${batch.id}` : '/api/batches'
            const method = isEdit ? 'PUT' : 'POST'
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            const data = await res.json()
            if (res.ok) {
                router.push('/dashboard/batches')
            } else {
                setError(data.message || 'Failed to save batch')
            }
        } catch { setError('Failed to save batch') }
        setSaving(false)
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="login__alert login__alert--error" style={{ marginBottom: '16px' }}>{error}</div>}
            <div className="exam-creation-container">
                <div className="exam-details-section">
                    <h3>Batch Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Batch Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Q1 2025 — Customer Care" />
                        </div>
                        <div className="form-group">
                            <label>Exam *</label>
                            <select value={examId} onChange={e => setExamId(e.target.value)} className="admin-select" required>
                                <option value="">Select exam</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date & Time *</label>
                            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>End Date & Time *</label>
                            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                        </div>
                    </div>
                    {isEdit && (
                        <label className="admin-checkbox-label">
                            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                            Active
                        </label>
                    )}
                </div>

                {/* Assign Teams */}
                <div className="exam-details-section">
                    <h3>Assign Teams ({selectedTeams.length} selected)</h3>
                    <div className="batch-assign-grid">
                        {teams.map(t => (
                            <label key={t.id} className={`batch-assign-item ${selectedTeams.includes(t.id) ? 'batch-assign-item--selected' : ''}`}>
                                <input type="checkbox" checked={selectedTeams.includes(t.id)} onChange={() => toggleTeam(t.id)} />
                                <div>
                                    <div className="batch-assign-name">{t.name}</div>
                                    <div className="batch-assign-sub">{t.unit}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Assign Individual Users */}
                <div className="exam-details-section">
                    <h3>Assign Individual Staff ({selectedUsers.length} selected)</h3>
                    <div className="batch-assign-grid">
                        {users.map(u => (
                            <label key={u.id} className={`batch-assign-item ${selectedUsers.includes(u.id) ? 'batch-assign-item--selected' : ''}`}>
                                <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleUser(u.id)} />
                                <div>
                                    <div className="batch-assign-name">{u.name}</div>
                                    <div className="batch-assign-sub">{u.username} · {u.unit || '—'}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => router.push('/dashboard/batches')}>Cancel</button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
                    {saving ? 'Saving...' : isEdit ? 'Update Batch' : 'Create Batch'}
                </button>
            </div>
        </form>
    )
}
