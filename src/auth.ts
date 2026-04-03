import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            name: string
            username: string
            role: string
        }
    }

    interface User {
        id: string
        name: string
        username: string
        role: string
    }
}

// @ts-expect-error - NextAuth v5 beta module augmentation
declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        username: string
        role: string
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            
            // On login, user object is present — write fields into token
            if (user) {
                token.id = user.id
                token.role = user.role
                token.username = user.username
            }
            return token
        },
        async session({ session, token }) {
            
            // On every request, read from token into session
            if (token) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.username = token.username as string
            }
            return session
        },
    },
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log('[AUTH] Authorize called with:', {
                    username: credentials?.username,
                    hasPassword: !!credentials?.password,
                    passwordLength: credentials?.password ? (credentials.password as string).length : 0
                })
                
                if (!credentials?.username || !credentials?.password) {
                    console.log('[AUTH] Missing credentials')
                    return null
                }

                try {
                    
                    // Retry logic for Neon cold starts
                    let users: { id: string; username: string; password: string; name: string; role: string; is_active: boolean }[] = [];
                    let attempts = 0;
                    const maxAttempts = 3;
                    
                    while (attempts < maxAttempts) {
                        try {
                            console.log(`[AUTH] Database attempt ${attempts + 1} for user: ${credentials.username}`)
                            users = await sql`
                                SELECT * FROM users
                                WHERE username = ${(credentials.username as string).toLowerCase()}
                                LIMIT 1
                            `
                            console.log(`[AUTH] Database query returned ${users.length} users`)
                            break; // Success, exit retry loop
                        } catch (dbError) {
                            attempts++;
                            console.log(`[AUTH] Database attempt ${attempts} failed:`, (dbError as Error).message)
                            
                            if (attempts >= maxAttempts) {
                                throw dbError; // Re-throw after max attempts
                            }
                            
                            // Wait before retry (exponential backoff)
                            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempts)))
                        }
                    }
                    
                    
                    const user = users[0];
                    if (!user) {
                        console.log('[AUTH] User not found in database')
                        return null
                    }
                    
                    if (!user.is_active) {
                        console.log('[AUTH] User is inactive')
                        return null
                    }
                    
                    console.log('[AUTH] Comparing passwords...')
                    const valid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    )
                    
                    console.log('[AUTH] Password comparison result:', valid)
                    
                    if (!valid) {
                        console.log('[AUTH] Invalid password')
                        return null
                    }

                    console.log('[AUTH] Authorization successful for:', user.username)
                    return {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        role: user.role,
                    }
                } catch (error) {
                    console.error('[AUTH] Authorization error:', error)
                    return null
                }
            },
        }),
    ],
})