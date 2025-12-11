import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Domains configuration
const ADMIN_SUBDOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.localhost';
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Extract subdomain from hostname
  // Handles: admin.yourdomain.com, admin.localhost:3000, etc.
  const isAdminSubdomain = 
    hostname.startsWith('admin.') || 
    hostname === ADMIN_SUBDOMAIN ||
    hostname.startsWith('admin.localhost');

  // Check if this is an admin subdomain request
  if (isAdminSubdomain) {
    // If accessing admin subdomain but not on an admin route, rewrite to admin routes
    if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api')) {
      // Rewrite /login to /admin/login, / to /admin/dashboard, etc.
      if (url.pathname === '/') {
        url.pathname = '/admin/dashboard';
      } else if (url.pathname === '/login') {
        url.pathname = '/admin/login';
      } else {
        url.pathname = `/admin${url.pathname}`;
      }
      return NextResponse.rewrite(url);
    }
  } else {
    // Not admin subdomain - block access to admin routes
    if (url.pathname.startsWith('/admin')) {
      // Redirect to main app home
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and api routes that don't need rewriting
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
