'use client'

import { useState } from 'react'
import Link from 'next/link'
import { showToast } from '@/ui/dashboard/toast'

export default function ExamsClient({ exams: initial }: { exams: any[] }) {
    const [exams, setExams] = useState(initial)
    const [search, setSearch] = useState('')

    const filtered = exams.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.category_name || '').toLowerCase().includes(search.toLowerCase())
    )

    async function toggleActive(id: string) {
        try {
            const res = await fetch(`/api/exams/${id}/toggle`, { method: 'PATCH' })
            const data = await res.json()
            if (res.ok) {
                setExams(prev => prev.map(e => e.id === id ? { ...e, is_active: data.is_active } : e))
                showToast(`Exam ${data.is_active ? 'activated' : 'deactivated'}`, 'success')
            } else {
                showToast(data.message, 'error')
            }
        } catch { showToast('Failed to update exam', 'error') }
    }

    async function deleteExam(id: string, title: string) {
        if (!confirm(`Delete "${title}"? This will also delete all results for this exam.`)) return
        try {
            const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setExams(prev => prev.filter(e => e.id !== id))
                showToast('Exam deleted', 'success')
            } else {
                const data = await res.json()
                showToast(data.message, 'error')
            }
        } catch { showToast('Failed to delete exam', 'error') }
    }

    return (
        <div>
            <div className="page-header">Exams Management</div>
            <div className="section-hdr">
                <span className="section-title">All Exams ({exams.length})</span>
                <Link href="/dashboard/exams/create" className="btn btn--primary btn--sm">+ Create Exam</Link>
            </div>
            <div className="toolbar-row">
                <input
                    type="text"
                    className="admin-search"
                    placeholder="Search exams..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <span className="pag-info">{filtered.length} results</span>
            </div>
            <div className="table__wrap" style={{ overflowX: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table__header">Title</th>
                            <th className="table__header">Category</th>
                            <th className="table__header">Duration</th>
                            <th className="table__header">Pass Mark</th>
                            <th className="table__header">Questions</th>
                            <th className="table__header">Results</th>
                            <th className="table__header">Status</th>
                            <th className="table__header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} className="table__empty">No exams found.</td></tr>
                        ) : filtered.map(exam => (
                            <tr key={exam.id} className="table__row">
                                <td className="table__cell table__cell--bold">{exam.title}</td>
                                <td className="table__cell table__cell--muted">{exam.category_name || '—'}</td>
                                <td className="table__cell">{exam.duration} mins</td>
                                <td className="table__cell">{exam.passing_score}%</td>
                                <td className="table__cell">{exam.question_count}</td>
                                <td className="table__cell">{exam.result_count}</td>
                                <td className="table__cell">
                                    <span className={`badge badge--${exam.is_active ? 'active' : 'expired'}`}>
                                        {exam.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="table__cell">
                                    <div className="admin-actions">
                                        <Link href={`/dashboard/exams/${exam.id}/edit`} className="admin-action-btn admin-action-btn--edit">Edit</Link>
                                        <button onClick={() => toggleActive(exam.id)} className="admin-action-btn admin-action-btn--toggle">
                                            {exam.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => deleteExam(exam.id, exam.title)} className="admin-action-btn admin-action-btn--delete">Delete</button>
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
