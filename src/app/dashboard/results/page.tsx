import { auth } from '@/auth';
import sql from '@/lib/db'
import ResultsClient from './results-client'

async function getMyResults(userId: string) {
    try {
        const rows = await sql.query(`
            SELECT
                r.id,
                r.score,
                r.total_questions,
                r.percentage,
                r.passed,
                r.time_taken,
                r.completed_at,
                e.title AS exam_title,
                e.duration,
                e.passing_score,
                (
                    SELECT b.name
                    FROM batches b
                    LEFT JOIN batch_members bm ON bm.batch_id = b.id AND bm.user_id = ?
                    WHERE b.exam_id = e.id
                      AND (bm.user_id IS NOT NULL
                           OR b.id IN (
                               SELECT bt.batch_id FROM batch_teams bt
                               JOIN users u ON u.team_id = bt.team_id
                               WHERE u.id = ?
                           ))
                    ORDER BY b.end_date DESC
                    LIMIT 1
                ) AS batch_name
            FROM results r
            JOIN exams e ON r.exam_id = e.id
            WHERE r.user_id = ?
            ORDER BY r.completed_at DESC
        `, [userId, userId, userId]);
        return rows;
    } catch (error) {
        console.error('[getMyResults]', error);
        return [];
    }
}

async function getMyResultsByCategory(userId: string) {
    try {
        const rows = await sql.query(`
            SELECT
                COALESCE(c.name, 'Uncategorised') AS category,
                COUNT(r.id) AS tests_taken,
                SUM(r.time_taken) AS total_time,
                SUM(r.total_questions) AS total_questions,
                SUM(CASE WHEN r.passed THEN 1 ELSE 0 END) AS total_passed,
                ROUND(AVG(r.percentage), 2) AS avg_percentage
            FROM results r
            JOIN exams e ON r.exam_id = e.id
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE r.user_id = ?
            GROUP BY c.name
            ORDER BY c.name
        `, [userId]);
        return rows;
    } catch (error) {
        console.error('[getMyResultsByCategory]', error);
        return [];
    }
}

export default async function ResultsPage() {
    const session = await auth();
    const userId = session?.user?.id!;

    const [results, byCategory] = await Promise.all([
        getMyResults(userId),
        getMyResultsByCategory(userId),
    ]);

    return (
        <ResultsClient
            results={results as any[]}
            byCategory={byCategory as any[]}
        />
    );
}
