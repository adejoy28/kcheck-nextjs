'use client'

import { useState, useEffect } from 'react'
import { signIn, getCsrfToken } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { showToast } from '@/ui/dashboard/toast'

export default function LoginForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get redirect URL from query params
    const redirectUrl = searchParams.get('redirect') || '/dashboard'

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const form = e.currentTarget
        const username = (form.elements.namedItem('username') as HTMLInputElement).value.trim()
        const password = (form.elements.namedItem('password') as HTMLInputElement).value

        if (!username || !password) {
            setError('Username and password are required')
            setLoading(false)
            return
        }

        try {
            // Get CSRF token
            const csrfToken = await getCsrfToken()
            
            const result = await signIn('credentials', {
                username,
                password,
                csrfToken,
                redirect: false,
            })

            setLoading(false)

            if (result?.error) {
                setError('Invalid username or password')
                showToast('Invalid username or password', 'error')
                return
            }

            showToast('Login successful', 'success')
            window.location.href = redirectUrl
        } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
            setLoading(false)
            setError('Login failed. Please try again.')
            showToast('Login failed. Please try again.', 'error')
        }
    }

    return (
        <>
            <h2 className="login__heading">Login</h2>

            {error && (
                <div className="login__alert login__alert--error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="login__group">
                    <label className="login__label" htmlFor="username">Username</label>
                    <input 
                        type="text" 
                        className="login__input" 
                        id="username" 
                        name="username" 
                        required
                        autoComplete="username"
                        disabled={loading}
                    />
                </div>
                
                <div className="login__group">
                    <label className="login__label" htmlFor="password">Password</label>
                    <input 
                        type="password" 
                        className="login__input" 
                        id="password" 
                        name="password" 
                        required
                        autoComplete="current-password"
                        disabled={loading}
                    />
                </div>
                
                <div className="login__checkbox">
                    <input 
                        type="checkbox" 
                        className="login__checkbox-input" 
                        id="remember" 
                        name="remember" 
                        disabled={loading}
                    />
                    <label className="login__checkbox-label" htmlFor="remember">Remember me</label>
                </div>
                
                <button 
                    type="submit" 
                    className="login__button"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Login'}
                </button>
            </form>
            
            <div className="login__forgot">
                <a className="login__forgot-link" href="/auth/forgot-password">Forgot Password?</a>
            </div>
        </>
    )
}