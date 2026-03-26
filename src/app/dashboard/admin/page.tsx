import { requireAdmin } from '@/lib/dal'

export default async function AdminDashboard() {
    await requireAdmin()

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Admin Functions</h2>
                <div className="space-y-4">
                    <div className="p-4 border rounded">
                        <h3 className="font-medium">User Management</h3>
                        <p className="text-gray-600">Manage user accounts and permissions</p>
                    </div>
                    <div className="p-4 border rounded">
                        <h3 className="font-medium">System Settings</h3>
                        <p className="text-gray-600">Configure system-wide settings</p>
                    </div>
                    <div className="p-4 border rounded">
                        <h3 className="font-medium">Reports</h3>
                        <p className="text-gray-600">View system reports and analytics</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
