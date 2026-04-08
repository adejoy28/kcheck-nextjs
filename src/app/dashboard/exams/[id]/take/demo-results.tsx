'use client'

import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/ui/DataTable'

interface DemoResultsPageProps {
    score: number
    total: number
    percentage: number
    passed: boolean
    examTitle: string
}

export default function DemoResultsPage({
    score,
    total,
    percentage,
    passed,
    examTitle
}: DemoResultsPageProps) {
    const router = useRouter()

    return (
        <div>
            <div className="page-header">Demo Test Results</div>
            
            <div className="section-hdr">
                <span className="section-title">Test Summary</span>
            </div>

            <DataTable
                useBemStyles={true}
                data={[{
                    exam_title: examTitle,
                    batch_name: 'Demo Test',
                    completed_at: new Date().toLocaleString('en-GB'),
                    duration: '10m 0s',
                    pass_mark: '80%',
                    score: score,
                    total: total,
                    percentage: percentage,
                    passed: passed
                }]}
                columns={[
                    { 
                        key: 'exam_title', 
                        label: 'Test',
                        className: 'table__cell--bold'
                    },
                    { 
                        key: 'batch_name', 
                        label: 'Batch',
                        hideOnMobile: true,
                        className: 'table__cell--muted'
                    },
                    { 
                        key: 'completed_at', 
                        label: 'Completed',
                        hideOnSmall: true
                    },
                    { 
                        key: 'duration', 
                        label: 'Duration',
                        hideOnSmall: true
                    },
                    { 
                        key: 'pass_mark', 
                        label: 'Pass Mark',
                        hideOnSmall: true
                    },
                    { 
                        key: 'score', 
                        label: 'Score',
                        hideOnSmall: true,
                        render: (_, row) => `${row.score} / ${row.total}`
                    },
                    { 
                        key: 'percentage', 
                        label: '%',
                        render: (value, row) => (
                            <div className="score-cell">
                                <span
                                    style={{
                                        fontWeight: 600,
                                        color: row.passed ? '#085041' : '#791f1f',
                                    }}
                                >
                                    {Number(value).toFixed(1)}%
                                </span>
                                <div className="score-bar-wrap">
                                    <div
                                        className={`score-bar score-bar--${row.passed ? 'pass' : 'fail'}`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                            </div>
                        )
                    },
                    { 
                        key: 'passed', 
                        label: 'Result',
                        render: (value) => (
                            <span className={`badge badge--${value ? 'pass' : 'fail'}`}>
                                {value ? 'Passed' : 'Failed'}
                            </span>
                        )
                    }
                ]}
            />

            <div className="toolbar-row" style={{ marginTop: '24px' }}>
                <div className="export-btns">
                    <button
                        onClick={() => router.back()}
                        className="btn btn--primary btn--sm"
                    >
                        Retake Demo Test
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="btn btn--outline btn--sm"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}
