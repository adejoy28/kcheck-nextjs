'use client'

import Link from 'next/link'
import { SimpleTable as DataTable, Column } from '@/components/SimpleTable'

interface AvailableTest {
    id: string
    title: string
    duration: number
    batch_name: string
    end_date: string
    actions?: never
}

interface TestsClientProps {
    tests: AvailableTest[]
}

const columns: Column<AvailableTest>[] = [
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
        key: 'end_date',
        label: 'Deadline',
        render: (value) => new Date(value as string).toLocaleDateString('en-GB')
    },
    {
        key: 'actions' as keyof AvailableTest,
        label: '',
        render: (_, row) => (
            <Link
                href={`/dashboard/exams/${row.id}/take`}
                className="btn btn--primary btn--sm"
            >
                Take Test
            </Link>
        )
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
