'use client';

import { useSidebar } from '@/context/SidebarContext';
import { useEffect } from 'react';
import SideNav from '@/ui/dashboard/sidenav';

export default function LayoutShell({ children, role }: { children: React.ReactNode; role: string }) {
    const { sidebarCollapsed, sidebarOpen, isMobile, toggleSidebar } = useSidebar();

    const handleBackdropClick = () => {
        if (isMobile && sidebarOpen) {
            toggleSidebar();
        }
    };

    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMobile && sidebarOpen) {
                toggleSidebar();
            }
        };

        const preventBodyScroll = (e: TouchEvent) => {
            if (isMobile && sidebarOpen) {
                e.preventDefault();
            }
        };

        if (isMobile && sidebarOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            document.addEventListener('touchmove', preventBodyScroll, { passive: false });
            document.body.style.overflow = 'hidden';
            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
                document.removeEventListener('touchmove', preventBodyScroll);
                document.body.style.overflow = '';
            };
        }
    }, [isMobile, sidebarOpen, toggleSidebar]);

    const layoutClasses = `layout ${sidebarCollapsed && !isMobile ? 'layout--collapsed' : ''} ${sidebarOpen && isMobile ? 'layout--open' : ''}`;

    return (
        <>
            {/* Mobile backdrop - rendered outside layout but inside layout shell */}
            {isMobile && (
                <div
                    className={`layout__backdrop ${sidebarOpen ? 'layout__backdrop--visible' : ''}`}
                    onClick={handleBackdropClick}
                    aria-hidden="true"
                />
            )}
            <div className={layoutClasses}>
                {/* Desktop sidebar - always visible on desktop, hidden on mobile */}
                {!isMobile && (
                    <div className="layout__sidebar">
                        <SideNav role={role} />
                    </div>
                )}
                {/* Mobile sidebar - rendered inside layout structure */}
                {isMobile && (
                    <div className={`layout__sidebar layout__sidebar--mobile ${sidebarOpen ? 'layout__sidebar--open' : ''}`}>
                        <SideNav role={role} />
                    </div>
                )}
                {children}
            </div>
        </>
    );
}
