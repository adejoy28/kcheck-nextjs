'use client';

import NavLinks from '@/ui/dashboard/nav-links';
import { useSidebar } from '@/context/SidebarContext';
import { X } from 'lucide-react';

export default function SideNav({ role }: { role: string }) {
    const { toggleSidebar, isMobile } = useSidebar();

    return (
        <div className="layout__sidebar">
            {isMobile && (
                <div className="sidebar__mobile-header">
                    <button
                        className="sidebar__close-btn"
                        onClick={toggleSidebar}
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
            <NavLinks role={role} />
        </div>
    );
}
