'use client'

import { DataTable, Column } from '@/components/ui/DataTable/index'

interface AdminResult {
    user_name: string
    exam_title: string
    percentage: number
    passed: boolean
    completed_at: string
}

interface AdminClientProps {
    recentResults: AdminResult[]
}

const columns: Column<AdminResult>[] = [
    { 
        key: 'user_name', 
        label: 'Staff',
        className: 'table__cell--bold'
    },
    { 
        key: 'exam_title', 
        label: 'Exam'
    },
    { 
        key: 'percentage', 
        label: 'Score',
        render: (value) => `${Number(value as number).toFixed(1)}%`
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
        className: 'table__cell--muted',
        render: (value) => new Date(value as string).toLocaleDateString('en-GB')
    }
]

export default function AdminClient({ recentResults }: AdminClientProps) {
    return (
        <DataTable
            useBemStyles={true}
            columns={columns}
            data={recentResults}
            emptyMessage="No results yet."
        />
    )
}
