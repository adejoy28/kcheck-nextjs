import SideNav from "@/ui/dashboard/sidenav";
import TopBar from "@/ui/dashboard/top-bar";
import Footer from "@/ui/dashboard/footer";
import { SidebarProvider } from "@/context/SidebarContext";
import LayoutShell from "@/ui/dashboard/layout-shell";
import { getUser } from "@/lib/dal";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await getUser();
    const role = user.role;

    return (
        <SidebarProvider>
            <LayoutShell>
                <div className="layout__topbar">
                    <TopBar />
                </div>
                <div className="layout__sidebar">
                    <SideNav role={role} />
                </div>
                <div className="layout__main">
                    <div className="layout__content">
                        {children}
                    </div>
                </div>
                <Footer />
            </LayoutShell>
        </SidebarProvider>
    )
}