import 'dotenv/config'
import postgres from 'postgres'
import bcrypt from 'bcryptjs'

const sql = postgres(process.env.DATABASE_URL!, { 
    ssl: 'require',
    connect_timeout: 30
})

async function seed() {
    try {
        console.log('Starting database seeding...')
        
        // Test connection first
        await sql`SELECT 1`
        console.log('✓ Database connection verified')

    // ── Teams ──────────────────────────────────────────────────────
    const [team1] = await sql`
        INSERT INTO teams (name, unit)
        VALUES ('Prepaid Call Center', 'Customer Care')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    const [team2] = await sql`
        INSERT INTO teams (name, unit)
        VALUES ('Postpaid Call Center', 'Customer Care')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    const [team3] = await sql`
        INSERT INTO teams (name, unit)
        VALUES ('Technical Support', 'Network Operations')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    console.log('✓ Teams seeded')

    // ── Categories ─────────────────────────────────────────────────
    const [cat1] = await sql`
        INSERT INTO categories (name) VALUES ('Compliance')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    const [cat2] = await sql`
        INSERT INTO categories (name) VALUES ('Product Knowledge')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    const [cat3] = await sql`
        INSERT INTO categories (name) VALUES ('Customer Service')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    console.log('✓ Categories seeded')

    // ── Users ──────────────────────────────────────────────────────
    const adminPassword = await bcrypt.hash('admin123', 12)
    const staffPassword = await bcrypt.hash('staff123', 12)

    const [admin] = await sql`
        INSERT INTO users (name, username, password, role, access_group)
        VALUES ('Admin User', 'admin', ${adminPassword}, 'ADMIN', 'Administrator')
        ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    const [staff1] = await sql`
        INSERT INTO users (name, username, password, role, phone, unit, access_group, team_id)
        VALUES ('John Doe', 'jdoe', ${staffPassword}, 'STAFF', '08012345678', 'Customer Care', 'Team Member', ${team1.id})
        ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    const [staff2] = await sql`
        INSERT INTO users (name, username, password, role, phone, unit, access_group, team_id)
        VALUES ('Alice Smith', 'asmith', ${staffPassword}, 'STAFF', '08087654321', 'Customer Care', 'Team Member', ${team2.id})
        ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    const [staff3] = await sql`
        INSERT INTO users (name, username, password, role, phone, unit, access_group, team_id)
        VALUES ('Bob Jones', 'bjones', ${staffPassword}, 'STAFF', '08055566677', 'Network Operations', 'Team Member', ${team3.id})
        ON CONFLICT (username) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
    `
    console.log('✓ Users seeded')

    // ── Exams ──────────────────────────────────────────────────────
    const [demoExam] = await sql`
        INSERT INTO exams (title, description, duration, passing_score, is_active, category_id, created_by_id)
        VALUES (
            'Demo Test',
            'A sample test for users to try out the system',
            10, 80, TRUE, ${cat1.id}, ${admin.id}
        )
        ON CONFLICT DO NOTHING
        RETURNING id
    `
    if (demoExam) {
        await sql`
            INSERT INTO questions (text, options, correct_answer, weight, exam_id) VALUES
            (
                'What is 2 + 2?',
                ARRAY['3', '4', '5', '6'],
                1, 1, ${demoExam.id}
            ),
            (
                'Which color is the sky?',
                ARRAY['Red', 'Green', 'Blue', 'Yellow'],
                2, 1, ${demoExam.id}
            ),
            (
                'How many days in a week?',
                ARRAY['5', '6', '7', '8'],
                2, 1, ${demoExam.id}
            )
        `
    }
    console.log('✓ Demo exam seeded')

    const [exam1] = await sql`
        INSERT INTO exams (title, description, duration, passing_score, is_active, category_id, created_by_id)
        VALUES (
            'Customer Care Fundamentals',
            'Basic knowledge check for all customer care staff',
            30, 60, TRUE, ${cat3.id}, ${admin.id}
        )
        ON CONFLICT DO NOTHING
        RETURNING id
    `
    if (exam1) {
        await sql`
            INSERT INTO questions (text, options, correct_answer, weight, exam_id) VALUES
            (
                'What is the standard greeting for inbound calls?',
                ARRAY['Hello, how can I help?', 'Thank you for calling Globacom, my name is [Name], how may I assist you?', 'Globacom, speak.', 'Yes, what do you want?'],
                1, 1, ${exam1.id}
            ),
            (
                'What should you do when a customer is angry?',
                ARRAY['Hang up immediately', 'Argue back to defend the company', 'Stay calm, listen actively, and empathise', 'Transfer the call without explanation'],
                2, 1, ${exam1.id}
            ),
            (
                'What is the maximum hold time before checking back with a customer?',
                ARRAY['5 minutes', '2 minutes', '10 minutes', 'No limit'],
                1, 1, ${exam1.id}
            ),
            (
                'Which of these is NOT a core value of Globacom?',
                ARRAY['Integrity', 'Excellence', 'Indifference', 'Innovation'],
                2, 1, ${exam1.id}
            ),
            (
                'How should you end a customer call?',
                ARRAY['Just hang up when done', 'Ask if there is anything else, thank the customer, and close politely', 'Tell the customer to call back if they have issues', 'Transfer to supervisor'],
                1, 1, ${exam1.id}
            )
        `
    }

    const [exam2] = await sql`
        INSERT INTO exams (title, description, duration, passing_score, is_active, category_id, created_by_id)
        VALUES (
            'Prepaid Products Knowledge',
            'Product knowledge test for prepaid call center staff',
            45, 70, TRUE, ${cat2.id}, ${admin.id}
        )
        ON CONFLICT DO NOTHING
        RETURNING id
    `
    if (exam2) {
        await sql`
            INSERT INTO questions (text, options, correct_answer, weight, exam_id) VALUES
            (
                'What is the validity period of the Glo Daily Plan?',
                ARRAY['24 hours', '48 hours', '72 hours', '7 days'],
                0, 1, ${exam2.id}
            ),
            (
                'Which code is used to check Glo account balance?',
                ARRAY['*124#', '*131#', '*777#', '*200#'],
                0, 1, ${exam2.id}
            ),
            (
                'What is the minimum recharge amount on the Glo network?',
                ARRAY['₦50', '₦100', '₦200', '₦500'],
                0, 1, ${exam2.id}
            )
        `
    }
    console.log('✓ Exams and questions seeded')

    // ── Batches ────────────────────────────────────────────────────
    const now = new Date()
    const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)

    if (exam1) {
        const [batch1] = await sql`
            INSERT INTO batches (name, start_date, end_date, is_active, exam_id)
            VALUES ('Q1 2025 — Customer Care Fundamentals', ${lastWeek}, ${inTwoWeeks}, TRUE, ${exam1.id})
            ON CONFLICT DO NOTHING
            RETURNING id
        `
        if (batch1) {
            await sql`
                INSERT INTO batch_members (batch_id, user_id) VALUES
                (${batch1.id}, ${staff1.id}),
                (${batch1.id}, ${staff2.id})
                ON CONFLICT DO NOTHING
            `
            await sql`
                INSERT INTO batch_teams (batch_id, team_id)
                VALUES (${batch1.id}, ${team1.id})
                ON CONFLICT DO NOTHING
            `
        }

        const [batch3] = await sql`
            INSERT INTO batches (name, start_date, end_date, is_active, exam_id)
            VALUES ('Q4 2024 — Customer Care Fundamentals', '2024-10-01', ${yesterday}, FALSE, ${exam1.id})
            ON CONFLICT DO NOTHING
            RETURNING id
        `
        if (batch3) {
            await sql`
                INSERT INTO batch_members (batch_id, user_id)
                VALUES (${batch3.id}, ${staff3.id})
                ON CONFLICT DO NOTHING
            `
        }
    }

    if (exam2) {
        const [batch2] = await sql`
            INSERT INTO batches (name, start_date, end_date, is_active, exam_id)
            VALUES ('Q1 2025 — Prepaid Products', ${now}, ${inTwoWeeks}, TRUE, ${exam2.id})
            ON CONFLICT DO NOTHING
            RETURNING id
        `
        if (batch2) {
            await sql`
                INSERT INTO batch_teams (batch_id, team_id)
                VALUES (${batch2.id}, ${team2.id})
                ON CONFLICT DO NOTHING
            `
        }
    }

    console.log('✓ Batches seeded')
    console.log('')
    console.log('─────────────────────────────────────────────')
    console.log('Seed complete. Test accounts:')
    console.log('  Admin   → username: admin   password: admin123')
    console.log('  Staff 1 → username: jdoe    password: staff123')
    console.log('  Staff 2 → username: asmith  password: staff123')
    console.log('  Staff 3 → username: bjones  password: staff123')
    console.log('─────────────────────────────────────────────')

    await sql.end()
    
    } catch (error: any) {
        console.error('Seed failed:', {
            message: error.message,
            code: error.code,
            severity: error.severity
        })
        
        // Provide specific error guidance
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            console.error('[seed] Network error - check database host and connectivity')
        } else if (error.message.includes('access denied') || error.message.includes('authentication')) {
            console.error('[seed] Authentication error - check credentials')
        } else if (error.message.includes('already exists')) {
            console.warn('[seed] Some data may already exist - this is usually safe')
        } else if (error.message.includes('syntax') || error.message.includes('SQL')) {
            console.error('[seed] SQL syntax error - check table structure')
        } else if (error.message.includes('constraint') || error.message.includes('duplicate')) {
            console.warn('[seed] Duplicate data detected - this is usually safe')
        }
        
        process.exit(1)
    }
}

seed()
