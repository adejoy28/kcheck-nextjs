'use client';

import Image from 'next/image';
import { logout } from '@/lib/actions';
import { ChevronDown, LogOut } from 'lucide-react';
import Hamburger from '@/ui/dashboard/hamburger';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export default function TopBar({ user }: { user: { name?: string; role?: string } }) {
    const userName = user?.name || 'User';
    const userRole = user?.role || '';
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const closeDropdown = () => {
        setDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        <div className="topbar">
            <div className="topbar__left">
                <Hamburger />
                <Link href="/" className="topbar__logo">
                    <Image src="/images/logo.png" alt="Logo" width={28} height={28} />
                </Link>
                <span className="topbar__title">KNOWLEDGE CHECK SYSTEM (CBT)</span>
            </div>
            <div className="topbar__right">
                <div className="topbar__user-menu" ref={dropdownRef}>
                    <button 
                        className="topbar__user-trigger"
                        onClick={toggleDropdown}
                        aria-expanded={dropdownOpen}
                        aria-haspopup="true"
                    >
                        <div className="topbar__avatar">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="topbar__user-info">
                            <span className="topbar__user-name">{userName}</span>
                            <span className="topbar__user-role">{userRole}</span>
                        </div>
                        <ChevronDown size={14} strokeWidth={2} className="topbar__chevron" />
                    </button>
                    {dropdownOpen && (
                        <div className="topbar__dropdown">
                            <div className="topbar__dropdown-header">
                                <strong>{userName}</strong>
                                <span>{userRole}</span>
                            </div>
                            <div className="topbar__dropdown-divider" />
                            <form action={logout}>
                                <button type="submit" className="topbar__dropdown-item topbar__dropdown-item--danger">
                                    <LogOut size={14} strokeWidth={1.8} />
                                    Logout
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}