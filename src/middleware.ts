import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that should never be rewritten
const IGNORED_PATHS = [
  '/_next',
  '/api',
  '/favicon',
  '/robots.txt',
  '/site.webmanifest',
  '/icon-',
  '/apple-touch-icon',
];

// File extensions that should never be rewritten
const IGNORED_EXTENSIONS = [
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', 
  '.js', '.css', '.woff', '.woff2', '.ttf', '.eot',
  '.json', '.xml', '.txt',
];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const hostname = request.headers.get('host') || '';
  
  // Skip static files and assets - check path prefix
  if (IGNORED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Skip files with static extensions
  if (IGNORED_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  // Check if this is an admin subdomain request
  // Handles: admin.yourdomain.com, admin.localhost:3000, etc.
  const isAdminSubdomain = 
    hostname.startsWith('admin.') || 
    hostname.startsWith('admin.localhost');

  if (isAdminSubdomain) {
    // If accessing admin subdomain but not on an admin route, rewrite to admin routes
    if (!pathname.startsWith('/admin')) {
      // Rewrite / to /admin/dashboard, /login to /admin/login, etc.
      if (pathname === '/') {
        url.pathname = '/admin/dashboard';
      } else if (pathname === '/login') {
        url.pathname = '/admin/login';
      } else {
        url.pathname = `/admin${pathname}`;
      }
      return NextResponse.rewrite(url);
    }
  } else {
    // Not admin subdomain - block access to admin routes
    if (pathname.startsWith('/admin')) {
      // Redirect to main app home
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - Static file extensions
     */
    '/((?!_next/static|_next/image|_next/webpack|favicon.ico).*)',
  ],
};



