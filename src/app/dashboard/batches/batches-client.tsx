'use client'

import { useState } from 'react'
import Link from 'next/link'
import { showToast } from '@/ui/dashboard/toast'
import { DataTable, Column, Action } from '@/components/ui/DataTable'

export default function BatchesClient({ batches: initial }: { batches: any[] }) {
    const [batches, setBatches] = useState(initial)

    const now = new Date()

    function getStatus(batch: any) {
        if (!batch.is_active) return 'inactive'
        if (new Date(batch.end_date) < now) return 'expired'
        if (new Date(batch.start_date) > now) return 'upcoming'
        return 'active'
    }

    const getActions = (row: any): Action[] => [
        {
            label: 'Edit',
            onClick: () => {
                window.location.href = `/dashboard/batches/${row.id}`
            },
            variant: 'primary'
        },
        {
            label: 'Delete',
            onClick: () => deleteBatch(row.id, row.name),
            variant: 'danger'
        }
    ]

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
            <DataTable
                useBemStyles={true}
                columns={[
                    { key: 'name', label: 'Batch Name', className: 'table__cell--bold' },
                    { key: 'exam_title', label: 'Exam', className: 'table__cell--muted', hideOnSmall: true },
                    { key: 'start_date', label: 'Start Date', render: (v) => new Date(v as string).toLocaleDateString('en-GB'), className: 'table__cell--muted', hideOnMobile: true },
                    { key: 'end_date', label: 'End Date', render: (v) => new Date(v as string).toLocaleDateString('en-GB'), className: 'table__cell--muted', hideOnMobile: true },
                    { key: 'member_count', label: 'Members', hideOnMobile: true },
                    { key: 'team_count', label: 'Teams', hideOnMobile: true },
                    { 
                        key: 'status', 
                        label: 'Status', 
                        render: (_, row) => {
                            const status = getStatus(row)
                            return (
                                <span className={`badge badge--${status}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                            )
                        }
                    },
                ]}
                data={batches}
                actions={getActions}
                emptyMessage="No batches yet."
            />
        </div>
    )
}
