'use client';

import { useSidebar } from '@/context/SidebarContext';

export default function Hamburger() {
    const { toggleSidebar } = useSidebar();

    return (
        <div
            className="hamburger"
            role="button"
            tabIndex={0}
            onClick={toggleSidebar}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleSidebar();
            }}
        >
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
        </div>
    );
}
