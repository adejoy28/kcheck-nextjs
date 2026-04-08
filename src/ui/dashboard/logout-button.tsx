'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-actions'

export default function LogoutButton() {
    const router = useRouter()

    async function handleLogout() {
        try {
            await signOut()
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
            Logout
        </button>
    )
}
