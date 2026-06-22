'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ExamProgress {
    currentQuestionIndex: number
    answers: (number | null)[]
    timeLeft: number
    startTime: string
    lastUpdated: string
}

interface UseExamProgressOptions {
    examId: string
    userId: string
    totalQuestions: number
    duration: number
    onProgressComplete?: () => void
}

export function useExamProgress({
    examId,
    userId,
    totalQuestions,
    duration,
    onProgressComplete
}: UseExamProgressOptions) {
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<(number | null)[]>(
        new Array(totalQuestions).fill(null)
    )
    const [timeLeft, setTimeLeft] = useState(duration * 60)
    const [startTime] = useState(Date.now())
    const [isLoading, setIsLoading] = useState(true)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)

    const storageKey = `exam_progress_${examId}_${userId}`
    const stateRef = useRef({ currentIndex: 0, answers: new Array(totalQuestions).fill(null), timeLeft: duration * 60 })
    const isLoadingRef = useRef(true)

    const syncRef = () => {
        stateRef.current = { currentIndex, answers, timeLeft }
    }

    const saveProgress = useCallback(async () => {
        const { currentIndex, answers, timeLeft } = stateRef.current
        const progressData: ExamProgress = {
            currentQuestionIndex: currentIndex,
            answers,
            timeLeft,
            startTime: new Date(startTime).toISOString(),
            lastUpdated: new Date().toISOString()
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(progressData))
            setLastSaved(new Date())
        } catch (error) {
            console.warn('Failed to save to localStorage:', error)
        }

        fetch(`/api/exams/${examId}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentQuestionIndex: currentIndex,
                answers,
                timeLeft
            })
        }).catch(error => {
            console.warn('Failed to save to server:', error)
        })
    }, [startTime, examId, storageKey])

    const loadProgress = useCallback(async () => {
        setIsLoading(true)
        isLoadingRef.current = true

        try {
            const localData = localStorage.getItem(storageKey)
            if (localData) {
                const progress: ExamProgress = JSON.parse(localData)
                const age = Date.now() - new Date(progress.lastUpdated).getTime()
                if (age < 60 * 60 * 1000) {
                    setCurrentIndex(progress.currentQuestionIndex)
                    setAnswers(progress.answers)
                    setTimeLeft(progress.timeLeft)
                    setLastSaved(new Date(progress.lastUpdated))
                }
            }

            const response = await fetch(`/api/exams/${examId}/progress`)
            if (response.ok) {
                const data = await response.json()
                if (data.progress) {
                    const serverProgress = data.progress as ExamProgress
                    const serverTime = new Date(serverProgress.lastUpdated).getTime()
                    const localTime = lastSaved?.getTime() || 0

                    if (serverTime > localTime) {
                        setCurrentIndex(serverProgress.currentQuestionIndex)
                        setAnswers(serverProgress.answers)
                        setTimeLeft(serverProgress.timeLeft)
                        setLastSaved(new Date(serverProgress.lastUpdated))

                        localStorage.setItem(storageKey, JSON.stringify(serverProgress))
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load progress:', error)
        } finally {
            setIsLoading(false)
            isLoadingRef.current = false
        }
    }, [examId, storageKey, lastSaved])

    const clearProgress = useCallback(async () => {
        try {
            localStorage.removeItem(storageKey)
            setLastSaved(null)

            await fetch(`/api/exams/${examId}/progress`, {
                method: 'DELETE'
            })
        } catch (error) {
            console.error('Failed to clear progress:', error)
        }
    }, [examId, storageKey])

    // Keep ref in sync whenever state changes
    useEffect(() => {
        syncRef()
    })

    // Auto-save every 30 seconds using ref (no stale closure)
    useEffect(() => {
        const saveInterval = setInterval(() => {
            if (!isLoadingRef.current) saveProgress()
        }, 30000)
        return () => clearInterval(saveInterval)
    }, [saveProgress])

    // Debounced save on state change
    useEffect(() => {
        if (!isLoading) {
            const timeout = setTimeout(saveProgress, 1000)
            return () => clearTimeout(timeout)
        }
    }, [currentIndex, answers, saveProgress, isLoading])

    useEffect(() => {
        loadProgress()
    }, [loadProgress])

    return {
        currentIndex,
        setCurrentIndex,
        answers,
        setAnswers,
        timeLeft,
        setTimeLeft,
        startTime,
        isLoading,
        lastSaved,
        saveProgress,
        clearProgress,
        hasProgress: answers.some(a => a !== null) || currentIndex > 0
    }
}
