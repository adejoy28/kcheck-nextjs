'use client';

import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext<{
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}>({ sidebarOpen: false, toggleSidebar: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(p => !p);

    return (
        <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => useContext(SidebarContext);
