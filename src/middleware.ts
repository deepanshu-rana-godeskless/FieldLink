// Middleware for Next.js to protect all /core routes
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    // Since we're using localStorage for tokens, we can't check auth in middleware
    // Auth checking will be handled client-side in components
    return NextResponse.next();
}

export const config = {
    matcher: ["/core/:path*"],
};
