import { handlers } from '@/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return await handlers.GET(request)
  } catch (error) {
    console.error('[AUTH] GET handler error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      method: request.method
    })
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handlers.POST(request)
  } catch (error) {
    console.error('[AUTH] POST handler error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      method: request.method
    })
    throw error
  }
}
