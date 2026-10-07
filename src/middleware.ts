import { NextResponse, type NextRequest } from 'next/server';

// Kept as a literal here (middleware runs on the edge runtime and must not
// import the DB-backed auth module). Must match AUTH_COOKIE in src/lib/auth.ts.
const AUTH_COOKIE = 'asiabd_auth';

const PROTECTED_PREFIXES = ['/dashboard', '/tools', '/library'];

/**
 * Gates the product behind authentication and forwards the current pathname
 * so server components can build accurate /signin?next=... redirects.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-asiabd-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Everything except Next internals, static assets, and files with extensions.
    '/((?!_next|images|videos|favicon|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};
