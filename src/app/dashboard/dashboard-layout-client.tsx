'use client';

import TopBar from "@/ui/dashboard/top-bar";
import Footer from "@/ui/dashboard/footer";
import { SidebarProvider } from "@/context/SidebarContext";
import LayoutShell from "@/ui/dashboard/layout-shell";

export default function DashboardLayoutClient({ 
    user, 
    role, 
    children 
}: { 
    user: { name?: string; role?: string }; 
    role: string; 
    children: React.ReactNode;
}) {
    
    return (
        <SidebarProvider>
            <div className="layout__topbar">
                <TopBar user={user} />
            </div>
            <LayoutShell role={role}>
                <div className="layout__main">
                    <div className="layout__content">
                        {children}
                    </div>
                </div>
            </LayoutShell>
            <Footer />
        </SidebarProvider>
    );
}
