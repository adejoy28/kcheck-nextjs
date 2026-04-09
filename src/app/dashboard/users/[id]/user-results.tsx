'use client'

import { useState } from 'react'
import { showToast } from '@/ui/dashboard/toast'
import { SimpleTable as DataTable } from '@/components/ui/SimpleTable'

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
        return (
            <DataTable
                useBemStyles={true}
                columns={[]}
                data={[]}
                emptyMessage="This user has not taken any tests yet."
            />
        )
    }

    return (
        <DataTable
            useBemStyles={true}
            columns={[
                { 
                    key: 'exam_title', 
                    label: 'Exam',
                    className: 'table__cell--bold'
                },
                { 
                    key: 'score', 
                    label: 'Score',
                    hideOnSmall: true,
                    render: (_, row) => `${row.score} / ${row.total_questions}`
                },
                { 
                    key: 'percentage', 
                    label: '%',
                    render: (value, row) => (
                        <span style={{ fontWeight: 600, color: row.passed ? '#085041' : '#791f1f' }}>
                            {Number(value).toFixed(1)}%
                        </span>
                    )
                },
                { 
                    key: 'time_taken', 
                    label: 'Duration',
                    hideOnSmall: true,
                    render: (value) => formatDuration(value)
                },
                { 
                    key: 'passed', 
                    label: 'Result',
                    render: (value) => (
                        <span className={`badge badge--${value ? 'pass' : 'fail'}`}>
                            {value ? 'Passed' : 'Failed'}
                        </span>
                    )
                },
                { 
                    key: 'completed_at', 
                    label: 'Date',
                    hideOnMobile: true,
                    className: 'table__cell--muted',
                    render: (value) => new Date(value).toLocaleDateString('en-GB')
                }
            ]}
            data={results}
            actions={(row) => [
                {
                    label: 'Grant Retake',
                    onClick: () => grantRetake(row.exam_id, row.exam_title),
                    variant: 'primary' as const
                }
            ]}
        />
    )
}
