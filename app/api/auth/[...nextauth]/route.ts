import NextAuth from 'next-auth';
import { authOptions } from '@lib/auth';

// Direct handler export pattern for Next.js 14 compatibility
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);

