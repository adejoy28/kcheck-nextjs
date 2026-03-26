'use client';

import { useSidebar } from '@/context/SidebarContext';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const { sidebarOpen } = useSidebar();

    return (
        <div className={`layout ${sidebarOpen ? 'layout--open' : ''}`}>
            {children}
        </div>
    );
}
