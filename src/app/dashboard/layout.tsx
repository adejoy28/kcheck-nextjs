import DashboardLayoutClient from './dashboard-layout-client';
import { getUser } from "@/lib/dal";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await getUser();
    const role = user.role;

    return <DashboardLayoutClient user={user} role={role}>{children}</DashboardLayoutClient>;
}