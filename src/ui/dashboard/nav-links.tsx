'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import {
    LayoutDashboard,
    ClipboardList,
    User,
    BarChart2,
    Users,
    Tag,
    Layers,
    TrendingUp,
    Settings,
} from 'lucide-react';

const iconProps = { size: 16, strokeWidth: 1.8 };

const staffItems = [
    { id: 'new-tests',  label: 'New Tests',  icon: <ClipboardList {...iconProps} />, href: '/dashboard' },
    { id: 'profile',    label: 'My Profile', icon: <User {...iconProps} />,          href: '/dashboard/profile' },
    { id: 'results',    label: 'My Results', icon: <BarChart2 {...iconProps} />,      href: '/dashboard/results' },
];

const adminItems = [
    {
        section: 'Admin Overview',
        items: [
            { id: 'admin', label: 'Admin Dashboard', icon: <LayoutDashboard {...iconProps} />, href: '/dashboard/admin' },
        ],
    },
    {
        section: 'Management',
        items: [
            { id: 'exams',      label: 'Exams',      icon: <ClipboardList {...iconProps} />, href: '/dashboard/exams' },
            { id: 'users',      label: 'Users',      icon: <Users {...iconProps} />,         href: '/dashboard/users' },
            { id: 'categories', label: 'Categories', icon: <Tag {...iconProps} />,           href: '/dashboard/categories' },
            { id: 'batches',    label: 'Batches',    icon: <Layers {...iconProps} />,        href: '/dashboard/batches' },
            { id: 'reports',  label: 'Reports',  icon: <TrendingUp {...iconProps} />, href: '/dashboard/reports' },
        ],
    },
    {
        section: 'System',
        items: [
            // { id: 'reports',  label: 'Reports',  icon: <TrendingUp {...iconProps} />, href: '/dashboard/reports' },
            // { id: 'settings', label: 'Settings', icon: <Settings {...iconProps} />,   href: '/dashboard/settings' },
        ],
    },
];

export default function NavLinks({ role }: { role: string }) {
    const pathname = usePathname();
    const { toggleSidebar, isMobile } = useSidebar();
    const isAdmin = role === 'ADMIN';

    const handleLinkClick = () => {
        if (isMobile) {
            toggleSidebar();
        }
    };

    return (
        <nav className="sidebar__nav">

            {/* My Dashboard — visible to ALL roles */}
            <div className="sidebar__section">
                <span className="sidebar__section-label">My Dashboard</span>
                {staffItems.map(item => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`sidebar__item ${pathname === item.href ? 'sidebar__item--active' : ''}`}
                        data-label={item.label}
                        onClick={handleLinkClick}
                    >
                        <span className="sidebar__icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* Admin sections — only visible to ADMIN role */}
            {isAdmin && adminItems.map(group => (
                <div key={group.section} className="sidebar__section">
                    <div className="sidebar__divider" />
                    <span className="sidebar__section-label">{group.section}</span>
                    {group.items.map(item => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`sidebar__item ${pathname === item.href ? 'sidebar__item--active' : ''}`}
                            data-label={item.label}
                            onClick={handleLinkClick}
                        >
                            <span className="sidebar__icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            ))}

        </nav>
    );
}
