'use client';

import { useSidebar } from '@/context/SidebarContext';

export default function Hamburger() {
    const { toggleCollapsed, toggleSidebar, isMobile } = useSidebar();

    const handleClick = () => {
        if (isMobile) {
            toggleSidebar();
        } else {
            toggleCollapsed();
        }
    };

    return (
        <div
            className="hamburger"
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClick();
            }}
        >
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
            <span className="hamburger__line"></span>
        </div>
    );
}
