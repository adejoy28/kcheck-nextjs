'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/ui/dashboard/toast'

interface Question {
    text: string
    options: string[]
    correct_answer: number
    weight: number
}

interface Props {
    categories: { id: string; name: string }[]
    exam?: any
}

export default function ExamForm({ categories, exam }: Props) {
    const router = useRouter()
    const isEdit = !!exam

    const [title, setTitle] = useState(exam?.title || '')
    const [description, setDescription] = useState(exam?.description || '')
    const [duration, setDuration] = useState(exam?.duration || 30)
    const [passingScore, setPassingScore] = useState(exam?.passing_score || 50)
    const [categoryId, setCategoryId] = useState(exam?.category_id || '')
    const [retakeAllowed, setRetakeAllowed] = useState(exam?.retake_allowed || false)
    const [isActive, setIsActive] = useState(exam?.is_active ?? true)
    const [questions, setQuestions] = useState<Question[]>(
        exam?.questions?.map((q: any) => ({
            text: q.text,
            options: q.options,
            correct_answer: q.correct_answer,
            weight: q.weight || 1,
        })) || []
    )
    const [saving, setSaving] = useState(false)

    function addQuestion() {
        setQuestions(prev => [...prev, { text: '', options: ['', '', '', ''], correct_answer: 0, weight: 1 }])
    }

    function removeQuestion(index: number) {
        setQuestions(prev => prev.filter((_, i) => i !== index))
    }

    function updateQuestion(index: number, field: string, value: any) {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
    }

    function updateOption(qIndex: number, optIndex: number, value: string) {
        setQuestions(prev => prev.map((q, i) => {
            if (i !== qIndex) return q
            const opts = [...q.options]
            opts[optIndex] = value
            return { ...q, options: opts }
        }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) { showToast('Title is required', 'error'); return }
        if (questions.length === 0) { showToast('Add at least one question', 'error'); return }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            if (!q.text.trim()) { showToast(`Question ${i + 1}: text is required`, 'error'); return }
            const validOpts = q.options.filter(o => o.trim())
            if (validOpts.length < 2) { showToast(`Question ${i + 1}: at least 2 options required`, 'error'); return }
        }

        setSaving(true)
        try {
            const body = { title, description, duration, passing_score: passingScore, category_id: categoryId || null, retake_allowed: retakeAllowed, is_active: isActive, questions }
            const url = isEdit ? `/api/exams/${exam.id}` : '/api/exams'
            const method = isEdit ? 'PUT' : 'POST'
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
            const data = await res.json()
            if (res.ok) {
                showToast(isEdit ? 'Exam updated' : 'Exam created', 'success')
                router.push('/dashboard/exams')
            } else {
                showToast(data.message || 'Failed to save exam', 'error')
            }
        } catch { showToast('Failed to save exam', 'error') }
        setSaving(false)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="exam-creation-container">
                <div className="exam-details-section">
                    <h3>Exam Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Title *</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="admin-select">
                                <option value="">No category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Duration (minutes) *</label>
                            <input type="number" value={duration} min={1} onChange={e => setDuration(Number(e.target.value))} required />
                        </div>
                        <div className="form-group">
                            <label>Passing Score (%)</label>
                            <input type="number" value={passingScore} min={0} max={100} onChange={e => setPassingScore(Number(e.target.value))} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                        </div>
                        <div className="form-group">
                            <label>Settings</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                <label className="admin-checkbox-label">
                                    <input type="checkbox" checked={retakeAllowed} onChange={e => setRetakeAllowed(e.target.checked)} />
                                    Allow retakes
                                </label>
                                {isEdit && (
                                    <label className="admin-checkbox-label">
                                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                        Active
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="exam-details-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3>Questions ({questions.length})</h3>
                        <button type="button" className="btn btn--outline btn--sm" onClick={addQuestion}>+ Add Question</button>
                    </div>
                    
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="question-block">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4>Question {qIndex + 1}</h4>
                                <button type="button" className="btn btn--outline btn--sm" onClick={() => removeQuestion(qIndex)}>Remove</button>
                            </div>
                            
                            <div className="form-group">
                                <label>Question Text *</label>
                                <textarea
                                    value={q.text}
                                    onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                    rows={2}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Options *</label>
                                {q.options.map((opt, optIndex) => (
                                    <div key={optIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correct_answer === optIndex}
                                            onChange={() => updateQuestion(qIndex, 'correct_answer', optIndex)}
                                        />
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                                            placeholder={`Option ${optIndex + 1}`}
                                            style={{ flex: 1 }}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Weight</label>
                                    <input
                                        type="number"
                                        value={q.weight}
                                        min={1}
                                        onChange={e => updateQuestion(qIndex, 'weight', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => router.push('/dashboard/exams')}>Cancel</button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
                    {saving ? 'Saving...' : isEdit ? 'Update Exam' : 'Create Exam'}
                </button>
            </div>
        </form>
    )
}
