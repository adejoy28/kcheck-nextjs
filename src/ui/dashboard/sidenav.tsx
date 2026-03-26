import NavLinks from '@/ui/dashboard/nav-links';

export default function SideNav({ role }: { role: string }) {
    return (
        <div className="layout__sidebar">
            <NavLinks role={role} />
        </div>
    );
}
