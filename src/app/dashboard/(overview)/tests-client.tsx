'use client'

import Link from 'next/link'
import { SimpleTable as DataTable, Column } from '@/components/ui/SimpleTable'

interface Test {
    id: string
    title: string
    duration: number
    batch_name: string
    start_date: string
    end_date: string
    status: string
    is_missed: boolean
    actions?: never
}

interface TestsClientProps {
    tests: Test[]
}

const columns: Column<Test>[] = [
    { 
        key: 'title', 
        label: 'Test',
        className: 'table__cell--bold'
    },
    { 
        key: 'batch_name', 
        label: 'Batch',
        className: 'table__cell--muted'
    },
    { 
        key: 'duration', 
        label: 'Duration',
        render: (value) => `${value as number} mins`
    },
    { 
        key: 'start_date', 
        label: 'Scheduled Date',
        render: (value) => new Date(value as string).toLocaleDateString('en-GB')
    },
    { 
        key: 'end_date', 
        label: 'End Date',
        render: (value) => new Date(value as string).toLocaleDateString('en-GB')
    },
    { 
        key: 'status', 
        label: 'Status',
        render: (value) => (
            <span className={`badge badge--${value}`}>
                {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
            </span>
        )
    },
    { 
        key: 'is_missed', 
        label: 'Is Missed',
        render: (value) => (
            <span className={`badge badge--${value ? 'missed' : 'ok'}`}>
                {value ? 'Yes' : 'No'}
            </span>
        )
    },
    { 
        key: 'actions' as keyof Test, 
        label: '',
        render: (_, row) => {
            if (row.status === 'active') {
                return (
                    <Link
                        href={`/dashboard/exams/${row.id}/take`}
                        className="btn btn--primary btn--sm"
                    >
                        Take Test
                    </Link>
                )
            } else if (row.status === 'upcoming') {
                return (
                    <span className="table__cell--muted" style={{ fontSize: '11px' }}>
                        Not yet open
                    </span>
                )
            } else {
                return <span style={{ color: '#ccc', fontSize: '11px' }}>—</span>
            }
        }
    }
]

export default function TestsClient({ tests }: TestsClientProps) {
    return (
        <DataTable
            useBemStyles={true}
            columns={columns}
            data={tests}
            emptyMessage="No tests assigned to you at the moment."
        />
    )
}
