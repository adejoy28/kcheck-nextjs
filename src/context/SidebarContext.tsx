'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext<{
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    toggleCollapsed: () => void;
    isMobile: boolean;
}>({ 
    sidebarOpen: false, 
    sidebarCollapsed: false,
    toggleSidebar: () => {}, 
    toggleCollapsed: () => {},
    isMobile: false
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const toggleCollapsed = () => {
        setSidebarCollapsed(prev => !prev);
    };

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 767);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <SidebarContext.Provider value={{ 
            sidebarOpen, 
            sidebarCollapsed, 
            toggleSidebar, 
            toggleCollapsed,
            isMobile 
        }}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => useContext(SidebarContext);
