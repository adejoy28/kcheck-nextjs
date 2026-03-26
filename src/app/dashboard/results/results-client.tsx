'use client'

import { useState } from 'react'

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s` 
}

export default function ResultsClient({
    results,
    byCategory,
}: {
    results: any[]
    byCategory: any[]
}) {
    const [view, setView] = useState<'test' | 'category'>('test')

    // Unique exam titles for the test dropdown filter
    const examTitles = Array.from(new Set(results.map((r) => r.exam_title)))
    const [selectedExam, setSelectedExam] = useState('all')

    // Unique categories for category dropdown filter
    const categoryNames = Array.from(new Set(byCategory.map((c) => c.category)))
    const [selectedCategory, setSelectedCategory] = useState('all')

    const filteredResults =
        selectedExam === 'all'
            ? results
            : results.filter((r) => r.exam_title === selectedExam)

    const filteredCategories =
        selectedCategory === 'all'
            ? byCategory
            : byCategory.filter((c) => c.category === selectedCategory)

    return (
        <div>
            <div className="page-header">My Results</div>

            {/* View toggle dropdown */}
            <div className="section-hdr" style={{ marginBottom: '16px' }}>
                <span className="section-title">
                    {view === 'test' ? 'Results by Test' : 'Results by Category'}
                </span>
                <select
                    className="results-view-select"
                    value={view}
                    onChange={(e) => setView(e.target.value as 'test' | 'category')}
                >
                    <option value="test">View by Test</option>
                    <option value="category">View by Category</option>
                </select>
            </div>

            {/* BY TEST VIEW */}
            {view === 'test' && (
                <div>
                    <div className="filter-row">
                        <label>Test</label>
                        <select
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                        >
                            <option value="all">All Tests</option>
                            {examTitles.map((title) => (
                                <option key={title} value={title}>
                                    {title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="toolbar-row">
                        <div className="export-btns">
                            <button className="btn btn--outline btn--sm">Export PDF</button>
                            <button className="btn btn--outline btn--sm">Export Excel</button>
                        </div>
                        <span className="pag-info">
                            Showing {filteredResults.length}{' '}
                            {filteredResults.length === 1 ? 'result' : 'results'}
                        </span>
                    </div>

                    <div className="table__wrap" style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="table__header">Test</th>
                                    <th className="table__header">Batch</th>
                                    <th className="table__header">Completed</th>
                                    <th className="table__header">Duration</th>
                                    <th className="table__header">Pass Mark</th>
                                    <th className="table__header">Score</th>
                                    <th className="table__header">%</th>
                                    <th className="table__header">Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="table__empty">
                                            No results found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResults.map((r) => (
                                        <tr key={r.id} className="table__row">
                                            <td className="table__cell table__cell--bold">
                                                {r.exam_title}
                                            </td>
                                            <td className="table__cell table__cell--muted">
                                                {r.batch_name || '—'}
                                            </td>
                                            <td className="table__cell">
                                                {new Date(r.completed_at).toLocaleString('en-GB')}
                                            </td>
                                            <td className="table__cell">
                                                {formatDuration(r.time_taken)}
                                            </td>
                                            <td className="table__cell">{r.passing_score}%</td>
                                            <td className="table__cell">
                                                {r.score} / {r.total_questions}
                                            </td>
                                            <td className="table__cell">
                                                <div className="score-cell">
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            color: r.passed ? '#085041' : '#791f1f',
                                                        }}
                                                    >
                                                        {Number(r.percentage).toFixed(1)}%
                                                    </span>
                                                    <div className="score-bar-wrap">
                                                        <div
                                                            className={`score-bar score-bar--${r.passed ? 'pass' : 'fail'}`}
                                                            style={{ width: `${r.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table__cell">
                                                <span
                                                    className={`badge badge--${r.passed ? 'pass' : 'fail'}`}
                                                >
                                                    {r.passed ? 'Passed' : 'Failed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* BY CATEGORY VIEW */}
            {view === 'category' && (
                <div>
                    <div className="filter-row">
                        <label>Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categoryNames.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="toolbar-row">
                        <div className="export-btns">
                            <button className="btn btn--outline btn--sm">Export PDF</button>
                            <button className="btn btn--outline btn--sm">Export Excel</button>
                        </div>
                        <span className="pag-info">
                            {filteredCategories.length}{' '}
                            {filteredCategories.length === 1 ? 'category' : 'categories'}
                        </span>
                    </div>

                    <div className="table__wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="table__header">Category</th>
                                    <th className="table__header">Tests Taken</th>
                                    <th className="table__header">Total Duration</th>
                                    <th className="table__header">Total Questions</th>
                                    <th className="table__header">Total Passed</th>
                                    <th className="table__header">Avg %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="table__empty">
                                            No category data available.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((c) => (
                                        <tr key={c.category} className="table__row">
                                            <td className="table__cell table__cell--bold">
                                                {c.category}
                                            </td>
                                            <td className="table__cell">{c.tests_taken}</td>
                                            <td className="table__cell">
                                                {formatDuration(Number(c.total_time))}
                                            </td>
                                            <td className="table__cell">{c.total_questions}</td>
                                            <td className="table__cell">{c.total_passed}</td>
                                            <td className="table__cell">
                                                <div className="score-cell">
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            color:
                                                                c.avg_percentage >= 50
                                                                    ? '#085041'
                                                                    : '#791f1f',
                                                        }}
                                                    >
                                                        {c.avg_percentage}%
                                                    </span>
                                                    <div className="score-bar-wrap">
                                                        <div
                                                            className={`score-bar score-bar--${c.avg_percentage >= 50 ? 'pass' : 'fail'}`}
                                                            style={{ width: `${c.avg_percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
