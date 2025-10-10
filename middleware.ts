import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to enforce subdomain-only access for super admin panel
 * 
 * Security: Super admin panel must only be accessed via:
 * - admin.senditfast.net (production)
 * - admin.localhost:3000 (local development)
 * 
 * Main domain (senditfast.net) access is blocked for security.
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Check if this is a super admin route
  const isSuperAdminRoute = 
    pathname.startsWith('/superadmin') || 
    pathname.startsWith('/api/superadmin');

  // Define admin subdomains
  const isAdminSubdomain = 
    hostname.startsWith('admin.') || 
    hostname.startsWith('admin.localhost');

  // SECURITY RULE 1: Block super admin access from main domain
  if (isSuperAdminRoute && !isAdminSubdomain) {
    console.warn(`[Security] Blocked super admin access from main domain: ${hostname}`);
    
    return NextResponse.json(
      { 
        error: 'Access Denied',
        message: 'Super admin panel must be accessed via admin subdomain',
        hint: 'Use admin.senditfast.net'
      },
      { status: 403 }
    );
  }

  // SECURITY RULE 2: Redirect admin subdomain root to super admin panel
  if (isAdminSubdomain && pathname === '/') {
    return NextResponse.redirect(new URL('/superadmin', request.url));
  }

  // SECURITY RULE 3: Block non-admin routes on admin subdomain (optional)
  if (isAdminSubdomain && !isSuperAdminRoute) {
    // Allow static assets and API routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/favicon') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Redirect everything else to super admin
    return NextResponse.redirect(new URL('/superadmin', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * But include /superadmin and /api/superadmin
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

