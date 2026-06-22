import 'dotenv/config'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

async function seed() {
    try {
        console.log('Starting database seeding...')

        await sql.query('SELECT 1')
        console.log('Database connection verified')

        const adminPassword = await bcrypt.hash('admin123', 12)
        const staffPassword = await bcrypt.hash('staff123', 12)

        const [existingAdmin] = await sql.query('SELECT id FROM users WHERE username = ?', ['admin'])
        if (!existingAdmin) {
            await sql.query(
                'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
                ['Admin User', 'admin', adminPassword, 'ADMIN']
            )
            console.log('Admin user created (admin / admin123)')
        } else {
            console.log('Admin user already exists')
        }

        const staffUsers = [
            { name: 'John Doe', username: 'jdoe' },
            { name: 'Alice Smith', username: 'asmith' },
            { name: 'Bob Jones', username: 'bjones' },
        ]
        for (const u of staffUsers) {
            const [existing] = await sql.query('SELECT id FROM users WHERE username = ?', [u.username])
            if (!existing) {
                await sql.query(
                    'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
                    [u.name, u.username, staffPassword, 'STAFF']
                )
                console.log(`Staff user created (${u.username} / staff123)`)
            }
        }

        const [existingDemo] = await sql.query("SELECT id FROM exams WHERE title = ?", ['Demo Test'])
        if (!existingDemo) {
            const result = await sql.query(
                "INSERT INTO exams (title, description, duration, passing_score, is_active) VALUES (?, ?, ?, ?, ?)",
                ['Demo Test', 'A sample test for users to try out the system', 10, 80, true]
            ) as any
            const examId = result.insertId

            const questions = [
                { text: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct_answer: 1 },
                { text: 'Which color is the sky?', options: ['Red', 'Green', 'Blue', 'Yellow'], correct_answer: 2 },
                { text: 'How many days in a week?', options: ['5', '6', '7', '8'], correct_answer: 2 },
            ]
            for (const q of questions) {
                await sql.query(
                    'INSERT INTO questions (text, options, correct_answer, weight, exam_id) VALUES (?, ?, ?, ?, ?)',
                    [q.text, JSON.stringify(q.options), q.correct_answer, 1, examId]
                )
            }
            console.log('Demo exam created with 3 questions')
        } else {
            console.log('Demo exam already exists')
        }

        console.log('')
        console.log('─────────────────────────────────────────────')
        console.log('Seed complete. Test accounts:')
        console.log('  Admin   - username: admin   password: admin123')
        console.log('  Staff 1 - username: jdoe    password: staff123')
        console.log('  Staff 2 - username: asmith  password: staff123')
        console.log('  Staff 3 - username: bjones  password: staff123')
        console.log('─────────────────────────────────────────────')

    } catch (error: unknown) {
        console.error('Seed failed:', {
            message: error instanceof Error ? error.message : String(error),
            code: (error as { code?: string })?.code,
        })
        process.exit(1)
    }
}

seed()
