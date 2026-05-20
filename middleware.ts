import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect these specific admin routes (NOT /admin/login)
  const protectedPaths = ['/admin', '/admin/bracelets', '/admin/upload', '/admin/customization']
  const isProtected = protectedPaths.includes(pathname)

  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // Explicitly only run on these paths
  matcher: ['/admin', '/admin/bracelets', '/admin/upload', '/admin/customization'],
}
