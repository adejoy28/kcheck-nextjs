import Image from 'next/image';
import { auth, signOut } from '@/auth';
import { ChevronDown, LogOut, Menu } from 'lucide-react';
import Hamburger from '@/ui/dashboard/hamburger';

export default async function TopBar({ user }: { user: { name?: string; role?: string } }) {
    const userName = user?.name || 'User';
    const userRole = user?.role || '';

    return (
        <div className="topbar">
            <div className="topbar__left">
                <Hamburger />
                <div className="topbar__logo">
                    <Image src="/images/logo.png" alt="Logo" width={28} height={28} />
                </div>
                <span className="topbar__title">KNOWLEDGE CHECK SYSTEM (CBT)</span>
            </div>
            <div className="topbar__right">
                <div className="topbar__user-menu">
                    <div className="topbar__user-trigger">
                        <div className="topbar__avatar">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="topbar__user-info">
                            <span className="topbar__user-name">{userName}</span>
                            <span className="topbar__user-role">{userRole}</span>
                        </div>
                        <ChevronDown size={14} strokeWidth={2} className="topbar__chevron" />
                    </div>
                    <div className="topbar__dropdown">
                        <div className="topbar__dropdown-header">
                            <strong>{userName}</strong>
                            <span>{userRole}</span>
                        </div>
                        <div className="topbar__dropdown-divider" />
                        <form action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/login' });
                        }}>
                            <button type="submit" className="topbar__dropdown-item topbar__dropdown-item--danger">
                                <LogOut size={14} strokeWidth={1.8} />
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}