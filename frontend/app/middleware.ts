import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(req: NextRequest) {
const token = req.cookies.get('token')?.value;
if (!token) return NextResponse.redirect(new URL('/login', req.url));
try {
const { sub, role } = verifyToken(token);
const res = NextResponse.next();
res.headers.set('x-user-id', sub);
res.headers.set('x-user-role', role);
return res;
} catch {
return NextResponse.redirect(new URL('/login', req.url));
}
}

export const config = {
matcher: [
'/dashboard/:path*',
'/api/logs',
'/api/instr/:path*',
],
};

