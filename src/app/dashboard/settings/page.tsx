import { getCurrentUser } from '@/lib/auth-utils';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
    const user = await getCurrentUser();

    return (
        <SettingsClient
            user={{
                name: user.name,
                username: user.username,
            }}
        />
    );
}
