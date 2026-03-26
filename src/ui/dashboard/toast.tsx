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
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // animate in
    requestAnimationFrame(() => {
        toast.classList.add('toast--visible');
    });

    // auto remove after 3.5s
    setTimeout(() => {
        toast.classList.remove('toast--visible');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3500);
}