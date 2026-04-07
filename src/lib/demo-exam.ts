import sql from '@/lib/db'

export async function getDemoExam() {
    try {
        const [exam] = await sql.query(`
            SELECT id, title, description, duration, passing_score
            FROM exams
            WHERE title = 'Demo Test' AND is_active = true
            LIMIT 1
        `)
        
        if (!exam) return null

        const questions = await sql.query('SELECT id, text, options FROM questions WHERE exam_id = ? ORDER BY id', [exam.id])

        return { 
            id: exam.id, 
            title: exam.title, 
            description: exam.description, 
            duration: exam.duration, 
            passing_score: exam.passing_score, 
            questions 
        }
    } catch (error) {
        console.error('[getDemoExam]', error)
        return null
    }
}
