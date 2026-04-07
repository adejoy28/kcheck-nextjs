import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

// GET exam progress
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const progress = await sql`
            SELECT 
                current_question_index,
                answers,
                time_left,
                start_time,
                last_updated,
                is_completed
            FROM exam_progress
            WHERE user_id = ${session.user.id} 
            AND exam_id = ${params.id}
            AND is_completed = FALSE
            ORDER BY last_updated DESC
            LIMIT 1
        `

        if (progress.length === 0) {
            return NextResponse.json({ progress: null })
        }

        // Check if progress is too old (older than exam duration + 1 hour)
        const progressData = progress[0]
        const ageInHours = (Date.now() - new Date(progressData.last_updated).getTime()) / (1000 * 60 * 60)
        if (ageInHours > 24) {
            // Delete old progress and return null
            await sql`
                DELETE FROM exam_progress
                WHERE user_id = ${session.user.id} 
                AND exam_id = ${params.id}
            `
            return NextResponse.json({ progress: null })
        }

        return NextResponse.json({ 
            progress: {
                currentQuestionIndex: progressData.current_question_index,
                answers: progressData.answers,
                timeLeft: progressData.time_left,
                startTime: progressData.start_time,
                lastUpdated: progressData.last_updated
            }
        })
    } catch (error) {
        console.error('[GET exam progress]', error)
        
        // If table doesn't exist, return null progress (graceful fallback)
        if (error instanceof Error && error.message.includes('does not exist')) {
            return NextResponse.json({ progress: null })
        }
        
        return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
    }
}

// POST/UPDATE exam progress
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { currentQuestionIndex, answers, timeLeft } = body

        // Validate input
        if (typeof currentQuestionIndex !== 'number' || 
            !Array.isArray(answers) || 
            typeof timeLeft !== 'number') {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        // Upsert progress
        await sql`
            INSERT INTO exam_progress (
                user_id, 
                exam_id, 
                current_question_index, 
                answers, 
                time_left,
                last_updated
            ) VALUES (
                ${session.user.id},
                ${params.id},
                ${currentQuestionIndex},
                ${JSON.stringify(answers)},
                ${timeLeft},
                NOW()
            )
            ON CONFLICT (user_id, exam_id)
            DO UPDATE SET
                current_question_index = EXCLUDED.current_question_index,
                answers = EXCLUDED.answers,
                time_left = EXCLUDED.time_left,
                last_updated = NOW()
        `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[POST exam progress]', error)
        
        // If table doesn't exist, still return success (local storage will work)
        if (error instanceof Error && error.message.includes('does not exist')) {
            return NextResponse.json({ success: true, warning: 'Server storage unavailable, using local only' })
        }
        
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
    }
}

// DELETE exam progress (when exam is completed)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await sql`
            DELETE FROM exam_progress
            WHERE user_id = ${session.user.id} 
            AND exam_id = ${params.id}
        `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[DELETE exam progress]', error)
        
        // If table doesn't exist, still return success (nothing to delete)
        if (error instanceof Error && error.message.includes('does not exist')) {
            return NextResponse.json({ success: true })
        }
        
        return NextResponse.json({ error: 'Failed to clear progress' }, { status: 500 })
    }
}
