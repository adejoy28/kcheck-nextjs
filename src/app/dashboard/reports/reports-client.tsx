'use client'

import { useState, useCallback } from 'react'
import { showToast } from '@/ui/dashboard/toast'
import { exportToPDF, exportToExcel } from '@/lib/export-utils'
import { SimpleTable as DataTable } from '@/components/ui/SimpleTable'

function formatDuration(seconds: number) {
    if (!seconds) return '—'
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s` 
}

interface Props {
    exams: any[]
    teams: any[]
    batches: any[]
}

export default function ReportsClient({ exams, teams, batches }: Props) {
    const [view, setView] = useState<'staff' | 'exam'>('staff')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const [examId, setExamId] = useState('')
    const [teamId, setTeamId] = useState('')
    const [batchId, setBatchId] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')

    const fetchReports = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ view })
            if (examId) params.set('exam_id', examId)
            if (teamId) params.set('team_id', teamId)
            if (batchId) params.set('batch_id', batchId)
            if (from) params.set('from', from)
            if (to) params.set('to', to)

            const res = await fetch(`/api/reports?${params}`)
            const data = await res.json()
            if (res.ok) {
                setResults(data)
                setSearched(true)
            } else {
                showToast(data.message || 'Failed to load reports', 'error')
            }
        } catch { showToast('Failed to load reports', 'error') }
        setLoading(false)
    }, [view, examId, teamId, batchId, from, to])

    const handleExportPDF = useCallback(async () => {
        if (results.length === 0) {
            showToast('No data to export', 'warning')
            return
        }
        try {
            await exportToPDF(results, view)
            showToast('PDF exported successfully', 'success')
        } catch (error) {
            console.error('[PDF Export] Error:', error)
            showToast('Failed to export PDF', 'error')
        }
    }, [results, view])

    const handleExportExcel = useCallback(() => {
        if (results.length === 0) {
            showToast('No data to export', 'warning')
            return
        }
        try {
            exportToExcel(results, view)
            showToast('Excel exported successfully', 'success')
        } catch (error) {
            showToast('Failed to export Excel', 'error')
        }
    }, [results, view])

    return (
        <div>
            <div className="page-header">Reports</div>

            <div className="section-hdr" style={{ marginBottom: '16px' }}>
                <span className="section-title">{view === 'staff' ? 'Results by Staff' : 'Results by Exam'}</span>
                <select className="results-view-select" value={view} onChange={e => { setView(e.target.value as any); setSearched(false); setResults([]) }}>
                    <option value="staff">View by Staff</option>
                    <option value="exam">View by Exam</option>
                </select>
            </div>

            <div className="filter-row">
                <label>Exam</label>
                <select className="admin-select" value={examId} onChange={e => setExamId(e.target.value)}>
                    <option value="">All Exams</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>

                {view === 'staff' && (
                    <>
                        <label>Team</label>
                        <select className="admin-select" value={teamId} onChange={e => setTeamId(e.target.value)}>
                            <option value="">All Teams</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>

                        <label>Batch</label>
                        <select className="admin-select" value={batchId} onChange={e => setBatchId(e.target.value)}>
                            <option value="">All Batches</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </>
                )}

                <label>From</label>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                <label>To</label>
                <input type="date" value={to} onChange={e => setTo(e.target.value)} />

                <button className="btn btn--primary btn--sm" onClick={fetchReports} disabled={loading}>
                    {loading ? 'Loading...' : 'Search'}
                </button>
                <button className="btn btn--outline btn--sm" onClick={() => { setExamId(''); setTeamId(''); setBatchId(''); setFrom(''); setTo(''); setResults([]); setSearched(false) }}>
                    Clear
                </button>
            </div>

            {searched && (
                <div className="toolbar-row">
                    <div className="export-btns">
                        <button className="btn btn--outline btn--sm" onClick={handleExportPDF}>Export PDF</button>
                        <button className="btn btn--outline btn--sm" onClick={handleExportExcel}>Export Excel</button>
                    </div>
                    <span className="pag-info">{results.length} {results.length === 1 ? 'result' : 'results'}</span>
                </div>
            )}

            {searched && view === 'staff' && (
                <DataTable
                    useBemStyles={true}
                    columns={[
                        { 
                            key: 'user_name', 
                            label: 'Staff',
                            className: 'table__cell--bold'
                        },
                        { 
                            key: 'team_name', 
                            label: 'Team',
                            hideOnMobile: true,
                            className: 'table__cell--muted',
                            render: (value) => value || '—'
                        },
                        { 
                            key: 'exam_title', 
                            label: 'Exam',
                            hideOnMobile: true
                        },
                        { 
                            key: 'batch_name', 
                            label: 'Batch',
                            hideOnSmall: true,
                            className: 'table__cell--muted',
                            render: (value) => value || '—'
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
                            key: 'passing_score', 
                            label: 'Pass Mark',
                            hideOnSmall: true,
                            render: (value) => `${value}%`
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
                    emptyMessage="No results match your filters."
                />
            )}

            {searched && view === 'exam' && (
                <DataTable
                    useBemStyles={true}
                    columns={[
                        { 
                            key: 'exam_title', 
                            label: 'Exam',
                            className: 'table__cell--bold'
                        },
                        { 
                            key: 'passing_score', 
                            label: 'Pass Mark',
                            hideOnSmall: true,
                            render: (value) => `${value}%`
                        },
                        { 
                            key: 'total_attempts', 
                            label: 'Total Attempts',
                            hideOnMobile: true
                        },
                        { 
                            key: 'total_passed', 
                            label: 'Passed',
                            hideOnMobile: true
                        },
                        { 
                            key: 'pass_rate', 
                            label: 'Pass Rate',
                            render: (value, row) => (
                                <div className="score-cell">
                                    <span style={{ fontWeight: 600, color: Number(value) >= Number(row.passing_score) ? '#085041' : '#791f1f' }}>
                                        {value}%
                                    </span>
                                    <div className="score-bar-wrap">
                                        <div className={`score-bar score-bar--${Number(value) >= Number(row.passing_score) ? 'pass' : 'fail'}`}
                                            style={{ width: `${value}%` }} />
                                    </div>
                                </div>
                            )
                        },
                        { 
                            key: 'avg_percentage', 
                            label: 'Avg Score',
                            hideOnMobile: true,
                            render: (value) => `${value}%`
                        }
                    ]}
                    data={results}
                    emptyMessage="No data matches your filters."
                />
            )}

            {!searched && (
                <DataTable
                    useBemStyles={true}
                    columns={[]}
                    data={[]}
                    emptyMessage="Set your filters above and click Search to load reports."
                />
            )}
        </div>
    )
}
