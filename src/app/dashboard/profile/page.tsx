import { auth } from '@/auth';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';

async function getUserProfile(userId: string) {
    try {
        const [user] = await sql`
            SELECT
                u.id, u.name, u.username, u.phone, u.unit, u.access_group, u.role,
                t.name AS team_name,
                COUNT(DISTINCT r.id) AS tests_taken,
                COUNT(DISTINCT CASE WHEN r.passed = true THEN r.id END) AS tests_passed,
                COALESCE(SUM(r.total_questions), 0) AS total_questions_attempted,
                COALESCE(SUM(
                    CASE WHEN r.passed = true
                    THEN ROUND(r.percentage * r.total_questions / 100)
                    ELSE 0 END
                ), 0) AS total_questions_passed,
                COALESCE(ROUND(AVG(r.percentage)::numeric, 2), 0) AS avg_percentage
            FROM users u
            LEFT JOIN teams t ON u.team_id = t.id
            LEFT JOIN results r ON r.user_id = u.id
            WHERE u.id = ${userId}
            GROUP BY u.id, t.name
        `;

        const totalBatches = await sql`
            SELECT COUNT(DISTINCT b.id) AS total
            FROM batches b
            WHERE (
                b.id IN (SELECT batch_id FROM batch_members WHERE user_id = ${userId})
                OR b.id IN (
                    SELECT bt.batch_id FROM batch_teams bt
                    JOIN users u ON u.team_id = bt.team_id
                    WHERE u.id = ${userId}
                )
            )
            AND b.end_date < NOW()
        `;

        const testsMissed = Number(totalBatches[0]?.total || 0) - Number(user?.tests_taken || 0);
        return { ...(user as any), tests_missed: Math.max(0, testsMissed) };
    } catch (error) {
        console.error('[getUserProfile]', error);
        return null;
    }
}

export default async function ProfilePage() {
    const user = await getCurrentUser();
    const userId = user.id;
    const profile = await getUserProfile(userId);

    if (!profile) {
        return (
            <div>
                <div className="page-header">My Profile</div>
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Unable to load profile. Please try refreshing the page.
                </div>
            </div>
        );
    }

    const passPct = profile.tests_taken > 0
        ? ((profile.tests_passed / profile.tests_taken) * 100).toFixed(1)
        : '0.0';

    return (
        <div>
            <div className="page-header">My Profile</div>

            <div className="stat-summary">
                <div className="stat-card">
                    <div className="stat-card__number">{profile.tests_taken}</div>
                    <div className="stat-card__label">Tests Taken</div>
                    <div className="stat-card__bar">
                        <div className="stat-card__bar-fill" style={{ width: '100%' }} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__number stat-card__number--success">
                        {profile.tests_passed}
                    </div>
                    <div className="stat-card__label">Tests Passed</div>
                    <div className="stat-card__bar">
                        <div
                            className="stat-card__bar-fill stat-card__bar-fill--success"
                            style={{
                                width: profile.tests_taken > 0
                                    ? `${(profile.tests_passed / profile.tests_taken) * 100}%` 
                                    : '0%'
                            }}
                        />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__number stat-card__number--danger">
                        {profile.tests_missed}
                    </div>
                    <div className="stat-card__label">Tests Missed</div>
                    <div className="stat-card__bar">
                        <div
                            className="stat-card__bar-fill stat-card__bar-fill--danger"
                            style={{ width: profile.tests_missed > 0 ? '100%' : '0%' }}
                        />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__number">{profile.avg_percentage}%</div>
                    <div className="stat-card__label">Avg Score</div>
                    <div className="stat-card__bar">
                        <div
                            className="stat-card__bar-fill"
                            style={{ width: `${profile.avg_percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="profile-cards">
                <div className="profile-card">
                    <div className="profile-card__head">Personal Information</div>
                    <div className="profile-card__body">
                        <div className="profile-row">
                            <span className="profile-label">Display Name</span>
                            <span className="profile-value">{profile.name}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Login Name</span>
                            <span className="profile-value">{profile.username}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Phone Number</span>
                            <span className="profile-value">{profile.phone || '—'}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Access Group</span>
                            <span className="profile-value profile-value--link">
                                {profile.access_group || '—'}
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Team</span>
                            <span className="profile-value profile-value--link">
                                {profile.team_name || '—'}
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Unit</span>
                            <span className="profile-value profile-value--link">
                                {profile.unit || '—'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-card__head">Test Statistics</div>
                    <div className="profile-card__body">
                        <div className="profile-row">
                            <span className="profile-label">Tests Taken</span>
                            <span className="profile-value">{profile.tests_taken}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Tests Passed</span>
                            <span className="profile-value profile-value--success">
                                {profile.tests_passed} / {profile.tests_taken}
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Tests Missed</span>
                            <span className="profile-value profile-value--danger">
                                {profile.tests_missed}
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Percent Tests Passed</span>
                            <span className="profile-value profile-value--success">
                                {passPct}%
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Questions Attempted</span>
                            <span className="profile-value">{profile.total_questions_attempted}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Questions Passed</span>
                            <span className="profile-value">
                                {profile.total_questions_passed} / {profile.total_questions_attempted}
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Average Percentage</span>
                            <span className="profile-value">{profile.avg_percentage}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
