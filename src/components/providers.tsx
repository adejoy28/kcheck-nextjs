'use client'

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Server-side auth() is the source of truth: every server component
      // render and every API route call validates the JWT cookie. The
      // client doesn't need to revalidate on focus/visibility — disabling
      // this removes one GET /api/auth/session per tab focus.
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  )
}
