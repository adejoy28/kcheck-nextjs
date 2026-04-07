'use client'

import { useState, useEffect, useCallback } from 'react'
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
    duration: number // in minutes
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

    // Local storage key
    const storageKey = `exam_progress_${examId}_${userId}`

    // Save progress to both local storage and server
    const saveProgress = useCallback(async () => {
        const progressData: ExamProgress = {
            currentQuestionIndex: currentIndex,
            answers,
            timeLeft,
            startTime: new Date(startTime).toISOString(),
            lastUpdated: new Date().toISOString()
        }

        // Save to local storage (immediate)
        try {
            localStorage.setItem(storageKey, JSON.stringify(progressData))
            setLastSaved(new Date())
        } catch (error) {
            console.warn('Failed to save to localStorage:', error)
        }

        // Save to server (async, don't wait)
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
    }, [currentIndex, answers, timeLeft, startTime, examId, storageKey])

    // Load progress from local storage first, then server
    const loadProgress = useCallback(async () => {
        setIsLoading(true)

        try {
            // Try local storage first (fastest)
            const localData = localStorage.getItem(storageKey)
            if (localData) {
                const progress: ExamProgress = JSON.parse(localData)
                
                // Check if local data is recent (less than 1 hour old)
                const age = Date.now() - new Date(progress.lastUpdated).getTime()
                if (age < 60 * 60 * 1000) { // 1 hour
                    setCurrentIndex(progress.currentQuestionIndex)
                    setAnswers(progress.answers)
                    setTimeLeft(progress.timeLeft)
                    setLastSaved(new Date(progress.lastUpdated))
                }
            }

            // Then try server (authoritative)
            const response = await fetch(`/api/exams/${examId}/progress`)
            if (response.ok) {
                const data = await response.json()
                if (data.progress) {
                    const serverProgress = data.progress as ExamProgress
                    
                    // Use server data if it's newer than local data
                    const serverTime = new Date(serverProgress.lastUpdated).getTime()
                    const localTime = lastSaved?.getTime() || 0
                    
                    if (serverTime > localTime) {
                        setCurrentIndex(serverProgress.currentQuestionIndex)
                        setAnswers(serverProgress.answers)
                        setTimeLeft(serverProgress.timeLeft)
                        setLastSaved(new Date(serverProgress.lastUpdated))
                        
                        // Update local storage with server data
                        localStorage.setItem(storageKey, JSON.stringify(serverProgress))
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load progress:', error)
        } finally {
            setIsLoading(false)
        }
    }, [examId, storageKey, lastSaved])

    // Clear progress (when exam is completed)
    const clearProgress = useCallback(async () => {
        try {
            localStorage.removeItem(storageKey)
            setLastSaved(null)
            
            // Clear from server
            await fetch(`/api/exams/${examId}/progress`, {
                method: 'DELETE'
            })
        } catch (error) {
            console.error('Failed to clear progress:', error)
        }
    }, [examId, storageKey])

    // Auto-save every 30 seconds or when answers change
    useEffect(() => {
        const saveInterval = setInterval(saveProgress, 30000) // 30 seconds
        return () => clearInterval(saveInterval)
    }, [saveProgress])

    // Save immediately when answers or current index changes
    useEffect(() => {
        if (!isLoading) {
            const timeout = setTimeout(saveProgress, 1000) // Debounce 1 second
            return () => clearTimeout(timeout)
        }
    }, [currentIndex, answers, saveProgress, isLoading])

    // Load progress on mount
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
