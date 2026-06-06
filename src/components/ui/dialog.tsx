'use client'

import React from 'react'

interface DialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'warning' | 'danger' | 'info'
}

export function Dialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
}: DialogProps) {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    const getConfirmButtonClass = () => {
        const baseClass = 'btn btn--primary'
        return type === 'danger' ? `${baseClass} btn--danger` : baseClass
    }

    const getTitleColor = () => {
        switch (type) {
            case 'danger':
                return '#dc2626'
            case 'warning':
                return '#d97706'
            case 'info':
                return '#2563eb'
            default:
                return '#111827'
        }
    }

    return (
        <div className="modal" style={{ display: 'flex' }}>
            <div className="modal__content" style={{ maxWidth: '400px' }}>
                <div className="modal__header">
                    <h2 style={{ margin: 0, color: getTitleColor() }}>{title}</h2>
                    <button 
                        className="modal__close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                
                <div className="modal__body">
                    <p style={{ margin: 0, lineHeight: '1.5' }}>{message}</p>
                </div>
                
                <div className="modal__footer">
                    <button 
                        className="btn btn--secondary"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={getConfirmButtonClass()}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
