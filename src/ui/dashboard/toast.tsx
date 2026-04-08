'use client';

import { useEffect } from 'react';

interface ToastProps {
    error?: string;
    message?: string;
}

export default function Toast({ error, message }: ToastProps) {
    useEffect(() => {
        if (message) showToast(message, 'success');
        if (error) showToast(error, 'error');
    }, [message, error]);

    return <div id="toastContainer" className="toast__container" />;
}

export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    // Toast functionality disabled - no-op function
    console.log(`[Toast ${type.toUpperCase()}] ${message}`);
}