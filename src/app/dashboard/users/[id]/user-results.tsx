'use client'

import { useState } from 'react'
import { showToast } from '@/ui/dashboard/toast'

function formatDuration(seconds: number) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s` 
}

export default function UserResults({ results: initial, userId }: { results: any[]; userId: string }) {
    const [results, setResults] = useState(initial)

    async function grantRetake(examId: string, examTitle: string) {
        if (!confirm(`Grant retake for "${examTitle}"? The existing result will be deleted.`)) return
        try {
            const res = await fetch('/api/retake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, exam_id: examId }),
            })
            const data = await res.json()
            if (res.ok) {
                setResults(prev => prev.filter(r => r.exam_id !== examId))
                showToast('Retake granted. Result deleted.', 'success')
            } else {
                showToast(data.message, 'error')
            }
        } catch { showToast('Failed to grant retake', 'error') }
    }

    if (results.length === 0) {
        return <div className="table__empty" style={{ padding: '24px', textAlign: 'center' }}>This user has not taken any tests yet.</div>
    }

    return (
        <div className="table__wrap" style={{ overflowX: 'auto' }}>
            <table className="table">
                <thead>
                    <tr>
                        <th className="table__header">Exam</th>
                        <th className="table__header">Score</th>
                        <th className="table__header">%</th>
                        <th className="table__header">Duration</th>
                        <th className="table__header">Result</th>
                        <th className="table__header">Date</th>
                        <th className="table__header">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map(r => (
                        <tr key={r.id} className="table__row">
                            <td className="table__cell table__cell--bold">{r.exam_title}</td>
                            <td className="table__cell">{r.score} / {r.total_questions}</td>
                            <td className="table__cell">
                                <span style={{ fontWeight: 600, color: r.passed ? '#085041' : '#791f1f' }}>
                                    {Number(r.percentage).toFixed(1)}%
                                </span>
                            </td>
                            <td className="table__cell">{formatDuration(r.time_taken)}</td>
                            <td className="table__cell">
                                <span className={`badge badge--${r.passed ? 'pass' : 'fail'}`}>
                                    {r.passed ? 'Passed' : 'Failed'}
                                </span>
                            </td>
                            <td className="table__cell table__cell--muted">
                                {new Date(r.completed_at).toLocaleDateString('en-GB')}
                            </td>
                            <td className="table__cell">
                                <button onClick={() => grantRetake(r.exam_id, r.exam_title)} className="admin-action-btn admin-action-btn--toggle">
                                    Grant Retake
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
