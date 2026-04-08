'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'

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

                    <DataTable
                        useBemStyles={true}
                        columns={[
                            { key: 'exam_title', label: 'Test', className: 'table__cell--bold' },
                            { key: 'batch_name', label: 'Batch', render: (v) => v || '—', className: 'table__cell--muted', hideOnSmall: true },
                            { key: 'completed_at', label: 'Completed', render: (v) => new Date(v).toLocaleString('en-GB'), hideOnMobile: true, className: 'table__cell--muted' },
                            { key: 'time_taken', label: 'Duration', render: formatDuration, hideOnSmall: true },
                            { key: 'passing_score', label: 'Pass Mark', render: (v) => `${v}%`, hideOnSmall: true },
                            { key: 'score', label: 'Score', render: (v, row) => `${v} / ${row.total_questions}` },
                            { 
                                key: 'percentage', 
                                label: '%', 
                                render: (v, row) => (
                                    <div className="score-cell">
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: row.passed ? '#085041' : '#791f1f',
                                            }}
                                        >
                                            {Number(v).toFixed(1)}%
                                        </span>
                                        <div className="score-bar-wrap">
                                            <div
                                                className={`score-bar score-bar--${row.passed ? 'pass' : 'fail'}`}
                                                style={{ width: `${v}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            },
                            { 
                                key: 'passed', 
                                label: 'Result', 
                                render: (v) => (
                                    <span className={`badge badge--${v ? 'pass' : 'fail'}`}>
                                        {v ? 'Passed' : 'Failed'}
                                    </span>
                                )
                            },
                        ]}
                        data={filteredResults}
                        emptyMessage="No results found."
                    />
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

                    <DataTable
                        useBemStyles={true}
                        columns={[
                            { key: 'category', label: 'Category', className: 'table__cell--bold' },
                            { key: 'tests_taken', label: 'Tests Taken' },
                            { key: 'total_time', label: 'Total Duration', render: (v) => formatDuration(Number(v)), hideOnSmall: true },
                            { key: 'total_questions', label: 'Total Questions', hideOnMobile: true },
                            { key: 'total_passed', label: 'Total Passed', hideOnMobile: true },
                            { 
                                key: 'avg_percentage', 
                                label: 'Avg %', 
                                render: (v) => (
                                    <div className="score-cell">
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: v >= 50 ? '#085041' : '#791f1f',
                                            }}
                                        >
                                            {v}%
                                        </span>
                                        <div className="score-bar-wrap">
                                            <div
                                                className={`score-bar score-bar--${v >= 50 ? 'pass' : 'fail'}`}
                                                style={{ width: `${v}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            },
                        ]}
                        data={filteredCategories}
                        emptyMessage="No category data available."
                    />
                </div>
            )}
        </div>
    )
}
