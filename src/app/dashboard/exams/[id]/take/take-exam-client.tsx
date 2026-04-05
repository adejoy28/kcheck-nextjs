'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/ui/dashboard/toast'

interface Question {
    id: string
    text: string
    options: string[]
}

interface Exam {
    id: string
    title: string
    description: string
    duration: number
    passing_score: number
    questions: Question[]
    isDemo?: boolean
}

export default function TakeExamClient({
    exam,
    userId,
}: {
    exam: Exam
    userId: string
}) {
    const router = useRouter()
    
    // Check if exam was auto-submitted and redirect
    useEffect(() => {
        const autoSubmitResult = sessionStorage.getItem('examAutoSubmitResult')
        if (autoSubmitResult) {
            sessionStorage.removeItem('examAutoSubmitResult')
            const result = JSON.parse(autoSubmitResult)
            
            if (result.isDemo) {
                const params = new URLSearchParams({
                    score: result.score.toString(),
                    total: result.total.toString(),
                    percentage: result.percentage.toString(),
                    passed: result.passed.toString(),
                    examTitle: result.examTitle
                })
                router.push(`/dashboard/exams/${exam.id}/take/demo-results?${params.toString()}`)
            } else {
                showToast(
                    result.passed
                        ? `Congratulations! You passed with ${result.percentage}%` 
                        : `You scored ${result.percentage}%. Keep studying!`,
                    result.passed ? 'success' : 'error'
                )
                router.push('/dashboard/results')
            }
            return
        }
    }, [exam.id, router])
    
    const [submitting, setSubmitting] = useState(false)
    const [isWideMode, setIsWideMode] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<(number | null)[]>(
        new Array(exam.questions.length).fill(null)
    )
    const [timeLeft, setTimeLeft] = useState(exam.duration * 60)
    const startTime = Date.now()

    // Prevent refresh and submit exam
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = 'Your exam will be submitted automatically. Are you sure you want to leave?'
            return e.returnValue
        }

        const handleUnload = () => {
            // Submit exam when page is unloaded
            const submitOnUnload = async () => {
                try {
                    const res = await fetch(`/api/exams/${exam.id}/submit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            answers, 
                            timeTaken: Math.floor((Date.now() - startTime) / 1000),
                            autoSubmit: true
                        }),
                    })
                    
                    if (res.ok) {
                        const data = await res.json()
                        // Store result info for redirect after page reload
                        sessionStorage.setItem('examAutoSubmitResult', JSON.stringify({
                            score: data.score,
                            total: data.total,
                            percentage: data.percentage,
                            passed: data.passed,
                            isDemo: data.isDemo,
                            examTitle: exam.title
                        }))
                    }
                } catch (error) {
                    console.error('Auto-submit failed:', error)
                }
            }
            
            // Use sendBeacon for more reliable submission during page unload
            const data = new Blob([
                JSON.stringify({
                    answers,
                    timeTaken: Math.floor((Date.now() - startTime) / 1000),
                    autoSubmit: true
                })
            ], { type: 'application/json' })
            
            navigator.sendBeacon(`/api/exams/${exam.id}/submit`, data)
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('unload', handleUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('unload', handleUnload)
        }
    }, [answers, exam.id, startTime])

    const submitExam = useCallback(
        async (autoSubmit = false) => {
            if (submitting) return
            setSubmitting(true)

            const unanswered = answers.filter((a) => a === null).length
            if (!autoSubmit && unanswered > 0) {
                const confirmed = window.confirm(
                    `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?` 
                )
                if (!confirmed) {
                    setSubmitting(false)
                    return
                }
            }

            const timeTaken = Math.floor((Date.now() - startTime) / 1000)

            try {
                const res = await fetch(`/api/exams/${exam.id}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers, timeTaken }),
                })

                const data = await res.json()

                if (!res.ok) {
                    showToast(data.message || 'Failed to submit exam', 'error')
                    setSubmitting(false)
                    return
                }

                // No progress to clear

                // Show different messages for demo vs regular exams
                if (data.isDemo) {
                    // Navigate to demo results page with score data
                    const params = new URLSearchParams({
                        score: data.score.toString(),
                        total: data.total.toString(),
                        percentage: data.percentage.toString(),
                        passed: data.passed.toString(),
                        examTitle: exam.title
                    })
                    router.push(`/dashboard/exams/${exam.id}/take/demo-results?${params.toString()}`)
                } else {
                    showToast(
                        data.passed
                            ? `Congratulations! You passed with ${data.percentage}%` 
                            : `You scored ${data.percentage}%. Keep studying!`,
                        data.passed ? 'success' : 'error'
                    )
                    router.push('/dashboard/results')
                }
            } catch (error) {
                console.error('[submitExam]', error)
                showToast('Something went wrong. Please try again.', 'error')
                setSubmitting(false)
            }
        },
        [answers, exam.id, router, startTime, submitting]
    )

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            submitExam(true)
            return
        }
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
        return () => clearInterval(timer)
    }, [timeLeft, submitExam])

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const timerWarning = timeLeft <= 300
    const timerCritical = timeLeft <= 60

    const currentQuestion = exam.questions[currentIndex]
    const answeredCount = answers.filter((a) => a !== null).length
    const progress = Math.round((answeredCount / exam.questions.length) * 100)

    return (
        <div className={`exam-take ${isWideMode ? 'exam-take--wide' : ''}`}>
            {/* Header */}
            <div className="exam-take__header">
                <div className="exam-take__info">
                    <h2 className="exam-take__title">{exam.title}</h2>
                    <span className="exam-take__progress-text">
                        Question {currentIndex + 1} of {exam.questions.length} &nbsp;·&nbsp;
                        {answeredCount} answered
                    </span>
                </div>
                <div className="exam-take__header-right">
                    <button
                        onClick={() => setIsWideMode(!isWideMode)}
                        className={`btn btn--outline btn--sm exam-take__wide-toggle`}
                        title={isWideMode ? "Exit wide mode" : "Enter wide mode (reduce distractions)"}
                    >
                        {isWideMode ? "⊟" : "⊞"}
                    </button>
                    <div
                        className={`exam-take__timer ${timerCritical ? 'exam-take__timer--critical' : timerWarning ? 'exam-take__timer--warning' : ''}`}
                    >
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="exam-take__progress-bar">
                <div
                    className="exam-take__progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question */}
            <div className="exam-take__question-card">
                <div className="exam-take__question-num">Question {currentIndex + 1}</div>
                <div className="exam-take__question-text">{currentQuestion.text}</div>

                <div className="exam-take__options">
                    {currentQuestion.options.map((option, optIndex) => (
                        <label
                            key={optIndex}
                            className={`exam-take__option ${answers[currentIndex] === optIndex ? 'exam-take__option--selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name={`question-${currentIndex}`}
                                value={optIndex}
                                checked={answers[currentIndex] === optIndex}
                                onChange={() => {
                                    const updated = [...answers]
                                    updated[currentIndex] = optIndex
                                    setAnswers(updated)
                                }}
                            />
                            <span className="exam-take__option-letter">
                                {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="exam-take__option-text">{option}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="exam-take__nav">
                <button
                    className="btn btn--secondary btn--sm"
                    onClick={() => setCurrentIndex((i) => i - 1)}
                    disabled={currentIndex === 0}
                >
                    Previous
                </button>

                {currentIndex < exam.questions.length - 1 ? (
                    <button
                        className="btn btn--primary btn--sm"
                        onClick={() => setCurrentIndex((i) => i + 1)}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        className="btn btn--primary btn--sm"
                        onClick={() => submitExam(false)}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                )}
            </div>

            {/* Question nav dots */}
            <div className="exam-take__dots">
                {exam.questions.map((_, i) => (
                    <button
                        key={i}
                        className={`exam-take__dot ${answers[i] !== null ? 'exam-take__dot--answered' : ''} ${i === currentIndex ? 'exam-take__dot--current' : ''}`}
                        onClick={() => setCurrentIndex(i)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    )
}
