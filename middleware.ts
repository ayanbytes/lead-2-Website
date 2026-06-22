import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If the user is requesting the login page, let them pass
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Check if they have the admin_session cookie
  const sessionCookie = request.cookies.get('admin_session');

  // If not authenticated, redirect to /login
  if (!sessionCookie || sessionCookie.value !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
