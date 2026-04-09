'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SimpleTable as DataTable, Column, Action } from '@/components/ui/SimpleTable'

export default function ExamsClient({ exams: initial }: { exams: any[] }) {
    const [exams, setExams] = useState(initial)
    const [search, setSearch] = useState('')

    const filtered = exams.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.category_name || '').toLowerCase().includes(search.toLowerCase())
    )

    const getActions = (row: any): Action[] => [
        {
            label: 'Edit',
            onClick: () => {
                window.location.href = `/dashboard/exams/${row.id}/edit`
            },
            variant: 'primary'
        },
        {
            label: row.is_active ? 'Deactivate' : 'Activate',
            onClick: () => toggleActive(row.id),
            variant: 'default'
        },
        {
            label: 'Delete',
            onClick: () => deleteExam(row.id, row.title),
            variant: 'danger'
        }
    ]

    async function toggleActive(id: string) {
        try {
            const res = await fetch(`/api/exams/${id}/toggle`, { method: 'PATCH' })
            const data = await res.json()
            if (res.ok) {
                setExams(prev => prev.map(e => e.id === id ? { ...e, is_active: data.is_active } : e))
                // showToast(`Exam ${data.is_active ? 'activated' : 'deactivated'}`, 'success')
            } else {
                // showToast(data.message, 'error')
            }
        } catch { /* showToast('Failed to update exam', 'error') */ }
    }

    async function deleteExam(id: string, title: string) {
        if (!confirm(`Delete "${title}"? This will also delete all results for this exam.`)) return
        try {
            const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setExams(prev => prev.filter(e => e.id !== id))
                // showToast('Exam deleted', 'success')
            } else {
                const data = await res.json()
                // showToast(data.message, 'error')
            }
        } catch { /* showToast('Failed to delete exam', 'error') */ }
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
            <DataTable
                useBemStyles={true}
                columns={[
                    { key: 'title', label: 'Title', className: 'table__cell--bold' },
                    { key: 'category_name', label: 'Category', render: (v) => (v as string) || '—', className: 'table__cell--muted' },
                    { key: 'duration', label: 'Duration', render: (v) => `${v as number} mins`, hideOnSmall: true },
                    { key: 'passing_score', label: 'Pass Mark', render: (v) => `${v as number}%`, hideOnSmall: true },
                    { key: 'question_count', label: 'Questions', hideOnMobile: true },
                    { key: 'result_count', label: 'Results', hideOnMobile: true },
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
                emptyMessage="No exams found."
            />
        </div>
    )
}
