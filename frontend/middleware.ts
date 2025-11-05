
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*',],
};

export default async function middleware(request: NextRequest) {

    const token = await getToken({ req: request });
    const url = request.nextUrl;

    if (
        token &&
        (url.pathname.startsWith('/auth'))
    ) {
        return NextResponse.redirect(new URL('/dashboard/preview/data-input', request.url));
    }

    if (
        !token &&
        (url.pathname.startsWith('/dashboard'))
    ) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    return NextResponse.next();
}