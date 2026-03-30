'use client'

import { useState, useCallback } from 'react'
import { showToast } from '@/ui/dashboard/toast'
import { exportToPDF, exportToExcel } from '@/lib/export-utils'

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

    const handleExportPDF = useCallback(() => {
        if (results.length === 0) {
            showToast('No data to export', 'warning')
            return
        }
        try {
            exportToPDF(results, view)
            showToast('PDF exported successfully', 'success')
        } catch (error) {
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
                <div className="table__wrap" style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="table__header">Staff</th>
                                <th className="table__header">Team</th>
                                <th className="table__header">Exam</th>
                                <th className="table__header">Batch</th>
                                <th className="table__header">Score</th>
                                <th className="table__header">%</th>
                                <th className="table__header">Duration</th>
                                <th className="table__header">Pass Mark</th>
                                <th className="table__header">Result</th>
                                <th className="table__header">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.length === 0 ? (
                                <tr><td colSpan={10} className="table__empty">No results match your filters.</td></tr>
                            ) : results.map(r => (
                                <tr key={r.id} className="table__row">
                                    <td className="table__cell table__cell--bold">{r.user_name}</td>
                                    <td className="table__cell table__cell--muted">{r.team_name || '—'}</td>
                                    <td className="table__cell">{r.exam_title}</td>
                                    <td className="table__cell table__cell--muted">{r.batch_name || '—'}</td>
                                    <td className="table__cell">{r.score} / {r.total_questions}</td>
                                    <td className="table__cell">
                                        <span style={{ fontWeight: 600, color: r.passed ? '#085041' : '#791f1f' }}>
                                            {Number(r.percentage).toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="table__cell">{formatDuration(r.time_taken)}</td>
                                    <td className="table__cell">{r.passing_score}%</td>
                                    <td className="table__cell">
                                        <span className={`badge badge--${r.passed ? 'pass' : 'fail'}`}>
                                            {r.passed ? 'Passed' : 'Failed'}
                                        </span>
                                    </td>
                                    <td className="table__cell table__cell--muted">
                                        {new Date(r.completed_at).toLocaleDateString('en-GB')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {searched && view === 'exam' && (
                <div className="table__wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="table__header">Exam</th>
                                <th className="table__header">Pass Mark</th>
                                <th className="table__header">Total Attempts</th>
                                <th className="table__header">Passed</th>
                                <th className="table__header">Pass Rate</th>
                                <th className="table__header">Avg Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.length === 0 ? (
                                <tr><td colSpan={6} className="table__empty">No data matches your filters.</td></tr>
                            ) : results.map(r => (
                                <tr key={r.exam_id} className="table__row">
                                    <td className="table__cell table__cell--bold">{r.exam_title}</td>
                                    <td className="table__cell">{r.passing_score}%</td>
                                    <td className="table__cell">{r.total_attempts}</td>
                                    <td className="table__cell">{r.total_passed}</td>
                                    <td className="table__cell">
                                        <div className="score-cell">
                                            <span style={{ fontWeight: 600, color: Number(r.pass_rate) >= Number(r.passing_score) ? '#085041' : '#791f1f' }}>
                                                {r.pass_rate}%
                                            </span>
                                            <div className="score-bar-wrap">
                                                <div className={`score-bar score-bar--${Number(r.pass_rate) >= Number(r.passing_score) ? 'pass' : 'fail'}`}
                                                    style={{ width: `${r.pass_rate}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table__cell">{r.avg_percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!searched && (
                <div className="table__empty" style={{ padding: '48px', textAlign: 'center' }}>
                    Set your filters above and click Search to load reports.
                </div>
            )}
        </div>
    )
}
