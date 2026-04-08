'use client';

import { LogOut } from 'lucide-react';

export default function LogoutForm() {
    const handleLogout = async () => {
        'use server';
        const { signOut } = await import('@/auth');
        await signOut();
    };

    return (
        <form action={handleLogout}>
            <button type="submit" className="topbar__dropdown-item topbar__dropdown-item--danger">
                <LogOut size={14} strokeWidth={1.8} />
                Logout
            </button>
        </form>
    );
}
