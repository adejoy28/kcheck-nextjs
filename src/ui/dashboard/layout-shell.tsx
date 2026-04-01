'use client';

import { useSidebar } from '@/context/SidebarContext';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const { sidebarOpen, sidebarCollapsed, isMobile } = useSidebar();

    return (
        <div className={`layout ${sidebarOpen && isMobile ? 'layout--open' : ''} ${sidebarCollapsed && !isMobile ? 'layout--collapsed' : ''}`}>
            {children}
        </div>
    );
}
