'use client';

import { useState } from 'react';

interface SettingsClientProps {
    user: { name?: string; username?: string };
}

export default function SettingsClient({ user }: SettingsClientProps) {
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: false,
    });
    const [preferences, setPreferences] = useState({
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
    });

    const handleNotificationChange = (type: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const handlePreferenceChange = (key: keyof typeof preferences, value: string) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // TODO: Save settings to backend
        console.log('Saving settings:', { notifications, preferences });
    };

    return (
        <div>
            <div className="page-header">Settings</div>

            <div className="section-hdr">
                <span className="section-title">Account Settings</span>
            </div>

            <div className="exam-creation-container">
                <div className="exam-details-section">
                    <h3>Personal Information</h3>
                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            defaultValue={user.name || ''}
                            placeholder="Enter your display name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            defaultValue={user.username || ''}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                        />
                    </div>
                </div>

                <div className="exam-details-section">
                    <h3>Notification Preferences</h3>
                    <div className="form-group">
                        <div className="form-checkbox-group">
                            <input
                                type="checkbox"
                                id="email-notifications"
                                className="form-checkbox"
                                checked={notifications.email}
                                onChange={() => handleNotificationChange('email')}
                            />
                            <label htmlFor="email-notifications" className="form-checkbox-label">
                                Email Notifications
                            </label>
                        </div>
                        <p className="form-help">Receive email updates about your tests and results</p>
                    </div>
                    <div className="form-group">
                        <div className="form-checkbox-group">
                            <input
                                type="checkbox"
                                id="push-notifications"
                                className="form-checkbox"
                                checked={notifications.push}
                                onChange={() => handleNotificationChange('push')}
                            />
                            <label htmlFor="push-notifications" className="form-checkbox-label">
                                Push Notifications
                            </label>
                        </div>
                        <p className="form-help">Receive browser push notifications for important updates</p>
                    </div>
                    <div className="form-group">
                        <div className="form-checkbox-group">
                            <input
                                type="checkbox"
                                id="sms-notifications"
                                className="form-checkbox"
                                checked={notifications.sms}
                                onChange={() => handleNotificationChange('sms')}
                            />
                            <label htmlFor="sms-notifications" className="form-checkbox-label">
                                SMS Notifications
                            </label>
                        </div>
                        <p className="form-help">Receive text messages for urgent notifications</p>
                    </div>
                </div>

                <div className="exam-details-section">
                    <h3>Preferences</h3>
                    <div className="form-group">
                        <label>Theme</label>
                        <select
                            className="form-select"
                            value={preferences.theme}
                            onChange={e => handlePreferenceChange('theme', e.target.value)}
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Language</label>
                        <select
                            className="form-select"
                            value={preferences.language}
                            onChange={e => handlePreferenceChange('language', e.target.value)}
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Timezone</label>
                        <select
                            className="form-select"
                            value={preferences.timezone}
                            onChange={e => handlePreferenceChange('timezone', e.target.value)}
                        >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn btn--primary" onClick={handleSave}>
                        Save Changes
                    </button>
                    <button className="btn btn--outline">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
