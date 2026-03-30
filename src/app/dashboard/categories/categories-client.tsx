'use client'

import { useState } from 'react'
import { showToast } from '@/ui/dashboard/toast'

export default function CategoriesClient({ categories: initial }: { categories: any[] }) {
    const [categories, setCategories] = useState(initial)
    const [newName, setNewName] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newName.trim()) return
        setSaving(true)
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim() }),
            })
            const data = await res.json()
            if (res.ok) {
                setCategories(prev => [...prev, { ...data, exam_count: 0 }])
                setNewName('')
                showToast('Category created', 'success')
            } else {
                showToast(data.message, 'error')
            }
        } catch { showToast('Failed to create category', 'error') }
        setSaving(false)
    }

    async function handleDelete(id: string, name: string, examCount: number) {
        if (examCount > 0) {
            showToast(`Cannot delete "${name}" — it has ${examCount} exam(s) assigned`, 'error')
            return
        }
        if (!confirm(`Delete category "${name}"?`)) return
        try {
            const res = await fetch('/api/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id))
                showToast('Category deleted', 'success')
            } else {
                const data = await res.json()
                showToast(data.message, 'error')
            }
        } catch { showToast('Failed to delete category', 'error') }
    }

    return (
        <div>
            <div className="page-header">Categories</div>

            <div className="exam-creation-container" style={{ maxWidth: '500px', marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 600, color: '#3a5a8a' }}>Add Category</h3>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        className="admin-search"
                        style={{ flex: 1 }}
                        placeholder="Category name"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
                        {saving ? 'Adding...' : 'Add'}
                    </button>
                </form>
            </div>

            <div className="table__wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="table__header">Category Name</th>
                            <th className="table__header">Exams</th>
                            <th className="table__header">Created</th>
                            <th className="table__header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr><td colSpan={4} className="table__empty">No categories yet.</td></tr>
                        ) : categories.map(c => (
                            <tr key={c.id} className="table__row">
                                <td className="table__cell table__cell--bold">{c.name}</td>
                                <td className="table__cell">{c.exam_count}</td>
                                <td className="table__cell table__cell--muted">
                                    {new Date(c.created_at).toLocaleDateString('en-GB')}
                                </td>
                                <td className="table__cell">
                                    <button
                                        onClick={() => handleDelete(c.id, c.name, Number(c.exam_count))}
                                        className="admin-action-btn admin-action-btn--delete"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
