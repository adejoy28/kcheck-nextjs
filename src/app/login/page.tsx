import LoginForm from '@/ui/login-form'
import { Suspense } from 'react'
import GlobacomLogo from '@/ui/globacom-logo'

export default function LoginPage() {
    return (
        <main className="login">
            <div className="login__card">
                
                {/* Brand panel */}
                <div className="login__brand">
                    <div className="login__logo">
                        <GlobacomLogo />
                    </div>
                    <h3 className="login__title">Knowledge Check</h3>
                    <div className="login__version">Version 1.0.0</div>
                </div>
                
                {/* Form panel */}
                <div className="login__form">
                    <Suspense>
                        <LoginForm />
                    </Suspense>
                </div>

            </div>
        </main>
    )
}


























