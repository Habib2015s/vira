import { NextResponse } from 'next/server'

export function middleware(request) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('token')?.value

    // فایل‌های static رو رد کن
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/fonts') ||
        pathname.startsWith('/api') ||
        /\.(.*)$/.test(pathname)
    ) {
        return NextResponse.next()
    }

    const isLoginPage = pathname === '/login'

    // نه token + نه login → برو login
    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // token داره + login → برو dashboard
    if (token && isLoginPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}