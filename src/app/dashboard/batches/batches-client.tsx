'use client'

import { useState } from 'react'
import Link from 'next/link'
import { showToast } from '@/ui/dashboard/toast'

export default function BatchesClient({ batches: initial }: { batches: any[] }) {
    const [batches, setBatches] = useState(initial)

    const now = new Date()

    function getStatus(batch: any) {
        if (!batch.is_active) return 'inactive'
        if (new Date(batch.end_date) < now) return 'expired'
        if (new Date(batch.start_date) > now) return 'upcoming'
        return 'active'
    }

    async function deleteBatch(id: string, name: string) {
        if (!confirm(`Delete batch "${name}"?`)) return
        try {
            const res = await fetch(`/api/batches/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setBatches(prev => prev.filter(b => b.id !== id))
                showToast('Batch deleted', 'success')
            } else {
                const data = await res.json()
                showToast(data.message, 'error')
            }
        } catch { showToast('Failed to delete batch', 'error') }
    }

    return (
        <div>
            <div className="page-header">Batches</div>
            <div className="section-hdr">
                <span className="section-title">All Batches ({batches.length})</span>
                <Link href="/dashboard/batches/create" className="btn btn--primary btn--sm">+ Create Batch</Link>
            </div>
            <div className="table__wrap" style={{ overflowX: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table__header">Batch Name</th>
                            <th className="table__header">Exam</th>
                            <th className="table__header">Start Date</th>
                            <th className="table__header">End Date</th>
                            <th className="table__header">Members</th>
                            <th className="table__header">Teams</th>
                            <th className="table__header">Status</th>
                            <th className="table__header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.length === 0 ? (
                            <tr><td colSpan={8} className="table__empty">No batches yet.</td></tr>
                        ) : batches.map(batch => {
                            const status = getStatus(batch)
                            return (
                                <tr key={batch.id} className="table__row">
                                    <td className="table__cell table__cell--bold">{batch.name}</td>
                                    <td className="table__cell">{batch.exam_title}</td>
                                    <td className="table__cell">{new Date(batch.start_date).toLocaleDateString('en-GB')}</td>
                                    <td className="table__cell">{new Date(batch.end_date).toLocaleDateString('en-GB')}</td>
                                    <td className="table__cell">{batch.member_count}</td>
                                    <td className="table__cell">{batch.team_count}</td>
                                    <td className="table__cell">
                                        <span className={`badge badge--${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                                    </td>
                                    <td className="table__cell">
                                        <div className="admin-actions">
                                            <Link href={`/dashboard/batches/${batch.id}`} className="admin-action-btn admin-action-btn--edit">Edit</Link>
                                            <button onClick={() => deleteBatch(batch.id, batch.name)} className="admin-action-btn admin-action-btn--delete">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
