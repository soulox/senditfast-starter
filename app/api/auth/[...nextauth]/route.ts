import NextAuth from 'next-auth';
import { authOptions } from '@lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Use .default for better compatibility with production builds
const NextAuthHandler = (NextAuth as any).default || NextAuth;
const handler = NextAuthHandler(authOptions);

export { handler as GET, handler as POST };

