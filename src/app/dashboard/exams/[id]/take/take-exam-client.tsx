'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog } from '@/components/ui/dialog'

interface Question {
    id: string
    text: string
    options: string[]
}

interface ResumeData {
    attemptId: string;
    endTime: string;
    savedAnswers: Record<string, number>;
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
    resumeData,
}: {
    exam: Exam
    userId: string
    resumeData?: ResumeData | null
}) {
    const router = useRouter()
    const attemptRef = useRef<{ attemptId: string; sessionToken: string; endTime: Date } | null>(null)
    const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
    const submittingRef = useRef(false)
    const originalRouterPushRef = useRef<typeof router.push | null>(null)
    const startTimeRef = useRef(Date.now())
    
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
                console.log(
                    result.passed
                        ? `Congratulations! You passed with ${result.percentage}%` 
                        : `You scored ${result.percentage}%. Keep studying!`
                )
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
    const [timeLeft, setTimeLeft] = useState(() => {
        // If resuming, calculate remaining time from resumeData
        if (resumeData?.endTime) {
            const remaining = Math.max(0, Math.floor((new Date(resumeData.endTime).getTime() - Date.now()) / 1000));
            console.log('[take-exam] Initial time from resume:', remaining);
            return remaining;
        }
        // Otherwise start with full duration
        return exam.duration * 60;
    })
    const [showNavigationDialog, setShowNavigationDialog] = useState(false)
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
    const [showSubmitDialog, setShowSubmitDialog] = useState(false)

    // Start/resume on mount
    useEffect(() => {
        if (exam.isDemo) return;

        console.log('[take-exam] Starting/resuming attempt for exam:', exam.id);
        
        fetch(`/api/exams/${exam.id}/attempts`, { method: 'POST' })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
                return r.json();
            })
            .then(data => {
                console.log('[take-exam] Attempt response:', data);
                
                if (!data.attemptId || !data.sessionToken) {
                    throw new Error('Invalid attempt response');
                }
                
                attemptRef.current = {
                    attemptId: data.attemptId,
                    sessionToken: data.sessionToken,
                    endTime: new Date(data.endTime),
                };
                
                // If resuming, server will handle time restoration via resumeData prop
                // Don't double-set time here since useState initializer already handled it
                if (data.resumed) {
                    console.log('[take-exam] Resumed attempt from server');
                } else {
                    console.log('[take-exam] New attempt started');
                }
            })
            .catch(err => {
                console.error('[start attempt]', err);
                // Don't auto-submit on API failure - let user continue with timer
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Restore saved answers if resuming
    useEffect(() => {
        if (resumeData?.savedAnswers) {
            const restored = new Array(exam.questions.length).fill(null);
            exam.questions.forEach((q, i) => {
                if (resumeData.savedAnswers[q.id] !== undefined) {
                    restored[i] = resumeData.savedAnswers[q.id];
                }
            });
            setAnswers(restored);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Prevent navigation and refresh (only for active attempts, not resumed ones)
    useEffect(() => {
        // Don't prevent navigation if we're resuming (no active attempt yet)
        if (resumeData && !attemptRef.current) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = 'Your exam will be submitted automatically. Are you sure you want to leave?'
            return e.returnValue
        }

        // Handle browser back/forward buttons
        const handlePopState = (e: PopStateEvent) => {
            e.preventDefault()
            setShowNavigationDialog(true)
            // Prevent the actual navigation
            window.history.pushState(null, '', window.location.pathname)
        }

        // Override router push to show our dialog
        const originalPush = router.push
        originalRouterPushRef.current = originalPush
        router.push = (url: string) => {
            if (url !== window.location.pathname) {
                setPendingNavigation(url)
                setShowNavigationDialog(true)
                return Promise.resolve(false)
            }
            return originalPush.call(router, url)
        }

        // Add history entry to prevent back button
        window.history.pushState(null, '', window.location.pathname)

        const handleUnload = () => {
            const currentTimeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
            
            const data = new Blob([
                JSON.stringify({
                    answers,
                    timeTaken: currentTimeTaken,
                    autoSubmit: true
                })
            ], { type: 'application/json' })
            
            navigator.sendBeacon(`/api/exams/${exam.id}/submit`, data)
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('unload', handleUnload)
        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('unload', handleUnload)
            window.removeEventListener('popstate', handlePopState)
            router.push = originalPush
        }
    }, [answers, exam.id, router, resumeData])

    const saveAnswer = useCallback((questionIndex: number, questionId: string, answerIndex: number) => {
        const updated = [...answers];
        updated[questionIndex] = answerIndex;
        setAnswers(updated);

        if (!attemptRef.current || exam.isDemo) return;
        const { attemptId, sessionToken } = attemptRef.current;

        // Debounce with a simple timeout — cancel previous
        if (saveTimers.current[questionIndex]) {
            clearTimeout(saveTimers.current[questionIndex]);
        }
        saveTimers.current[questionIndex] = setTimeout(() => {
            fetch(`/api/exams/${exam.id}/attempts/${attemptId}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-exam-session': sessionToken,
                },
                body: JSON.stringify({ questionId, answerIndex }),
            }).catch(err => console.error('[saveAnswer]', err));
        }, 400);
    }, [answers, exam.id, exam.isDemo]);

    // Ping loop for multi-tab prevention
    useEffect(() => {
        if (exam.isDemo) return;
        
        const interval = setInterval(async () => {
            if (!attemptRef.current) return;
            const { attemptId, sessionToken } = attemptRef.current;
            
            try {
                const res = await fetch(`/api/exams/${exam.id}/attempts/${attemptId}/ping`, {
                    method: 'POST',
                    headers: { 'x-exam-session': sessionToken },
                });
                const data = await res.json();
                if (!data.valid) {
                    // Another tab took over — show warning (do not auto-submit)
                    console.warn('Session invalidated — another tab may be open');
                }
            } catch { /* ignore network errors */ }
        }, 30_000);

        return () => clearInterval(interval);
    }, [exam.id, exam.isDemo]);

    const submitExam = useCallback(
        async (autoSubmit = false) => {
            if (submittingRef.current) {
                return
            }
            submittingRef.current = true
            setSubmitting(true)

            const unanswered = answers.filter((a) => a === null).length
            
            if (!autoSubmit && unanswered > 0) {
                setShowSubmitDialog(true)
                submittingRef.current = false
                setSubmitting(false)
                return
            }

            const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)

            try {
                const res = await fetch(`/api/exams/${exam.id}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(attemptRef.current ? { 'x-exam-session': attemptRef.current.sessionToken } : {}),
                    },
                    body: JSON.stringify({ answers, timeTaken }),
                })

                const data = await res.json()

                if (!res.ok) {
                    console.error(data.message || 'Failed to submit exam')
                    submittingRef.current = false
                    setSubmitting(false)
                    return
                }

                if (data.isDemo) {
                    const params = new URLSearchParams({
                        score: data.score.toString(),
                        total: data.total.toString(),
                        percentage: data.percentage.toString(),
                        passed: data.passed.toString(),
                        examTitle: exam.title
                    })
                    const demoUrl = `/dashboard/exams/${exam.id}/take/demo-results?${params.toString()}`
                    
                    if (originalRouterPushRef.current) {
                        originalRouterPushRef.current(demoUrl)
                    } else {
                        window.location.href = demoUrl
                    }
                } else {
                    console.log(
                        data.passed
                            ? `Congratulations! You passed with ${data.percentage}%` 
                            : `You scored ${data.percentage}%. Keep studying!`
                    )
                    const resultsUrl = '/dashboard/results'
                    
                    if (originalRouterPushRef.current) {
                        originalRouterPushRef.current(resultsUrl)
                    } else {
                        window.location.href = resultsUrl
                    }
                }
            } catch (error) {
                console.error('submitExam error:', error)
                submittingRef.current = false
                setSubmitting(false)
            }
        },
        [answers, exam.id]
    )

    // Get dynamic dialog message based on navigation type
    const getNavigationMessage = useCallback(() => {
        if (pendingNavigation === 'BROWSER_BACK') {
            return "Are you sure you want to go back? Your exam will be submitted automatically and you won't be able to return."
        } else {
            return "Are you sure you want to leave? Your exam will be submitted automatically and you won't be able to return."
        }
    }, [pendingNavigation])

    // Handle navigation dialog actions
    const handleNavigationConfirm = useCallback(async () => {
        if (pendingNavigation === 'BROWSER_BACK') {
            // Submit exam before going back
            await submitExam(true)
            
            // After submission, use actual browser back navigation
            setTimeout(() => {
                // Check if we're still on the exam page (meaning no redirect happened)
                if (window.location.pathname.includes('/take')) {
                    // Use a flag to prevent the popstate handler from triggering again
                    sessionStorage.setItem('skipNextPopState', 'true')
                    // Then go back
                    window.history.back()
                }
            }, 200)
        } else if (pendingNavigation) {
            // Submit exam before navigating
            await submitExam(true)
            
            // Check if the exam submission already caused a redirect (for demo exams)
            // If it's a demo exam, the submission will redirect to demo results
            // So we don't need to navigate to the intended destination
            
            // For demo exams, don't navigate elsewhere - let the demo results redirect happen
            // For regular exams, navigate to intended destination
            setTimeout(() => {
                if (window.location.pathname.includes('/take')) {
                    if (originalRouterPushRef.current) {
                        originalRouterPushRef.current(pendingNavigation)
                    } else {
                        window.location.href = pendingNavigation
                    }
                }
            }, 200)
        } else {
            setShowNavigationDialog(false)
        }
    }, [pendingNavigation, submitExam])

    const handleNavigationCancel = useCallback(() => {
        setShowNavigationDialog(false)
        setPendingNavigation(null)
    }, [])

    const handleSubmitConfirm = useCallback(async () => {
        setShowSubmitDialog(false)
        setSubmitting(true)
        const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)

        try {
            const res = await fetch(`/api/exams/${exam.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(attemptRef.current ? { 'x-exam-session': attemptRef.current.sessionToken } : {}),
                },
                body: JSON.stringify({ answers, timeTaken }),
            })

            const data = await res.json()

            if (!res.ok) {
                console.error(data.message || 'Failed to submit exam')
                setSubmitting(false)
                return
            }

            if (data.isDemo) {
                const params = new URLSearchParams({
                    score: data.score.toString(),
                    total: data.total.toString(),
                    percentage: data.percentage.toString(),
                    passed: data.passed.toString(),
                    examTitle: exam.title
                })
                if (originalRouterPushRef.current) {
                    originalRouterPushRef.current(`/dashboard/exams/${exam.id}/take/demo-results?${params.toString()}`)
                } else {
                    window.location.href = `/dashboard/exams/${exam.id}/take/demo-results?${params.toString()}`;
                }
            } else {
                console.log(
                    data.passed
                        ? `Congratulations! You passed with ${data.percentage}%` 
                        : `You scored ${data.percentage}%. Keep studying!`
                )
                if (originalRouterPushRef.current) {
                    originalRouterPushRef.current('/dashboard/results')
                } else {
                    window.location.href = '/dashboard/results';
                }
            }
        } catch (error) {
            console.error('[submitExam]', error)
            setSubmitting(false)
        }
    }, [answers, exam.id, exam.title])

    const handleSubmitCancel = useCallback(() => {
        setShowSubmitDialog(false)
    }, [])


    // Countdown timer
    useEffect(() => {
        console.log('[take-exam] Timer effect running, timeLeft:', timeLeft);
        if (timeLeft <= 0) {
            console.log('[take-exam] Timer reached 0, auto-submitting...');
            submitExam(true)
            return
        }
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                const newTime = t - 1;
                if (newTime <= 0) {
                    console.log('[take-exam] Timer countdown reached 0, will auto-submit');
                }
                return newTime;
            });
        }, 1000)
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
                                onChange={() => saveAnswer(currentIndex, currentQuestion.id, optIndex)}
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

            
            {/* Navigation Confirmation Dialog */}
            <Dialog
                isOpen={showNavigationDialog}
                onClose={handleNavigationCancel}
                onConfirm={handleNavigationConfirm}
                title="Leave Exam?"
                message={getNavigationMessage()}
                confirmText="Submit & Leave"
                cancelText="Stay in Exam"
                type="warning"
            />

            {/* Submit Confirmation Dialog */}
            <Dialog
                isOpen={showSubmitDialog}
                onClose={handleSubmitCancel}
                onConfirm={handleSubmitConfirm}
                title="Submit Exam?"
                message={`You have ${answers.filter((a) => a === null).length} unanswered question${answers.filter((a) => a === null).length > 1 ? 's' : ''}. Are you sure you want to submit?`}
                confirmText="Submit Anyway"
                cancelText="Review Answers"
                type="warning"
            />
        </div>
    )
}
