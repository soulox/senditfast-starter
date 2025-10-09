import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { sql } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const [user] = await sql`
          select id, email, name, password_hash, plan
          from app_user
          where email = ${credentials.email}
          limit 1
        ` as any[];

        if (!user) {
          return null;
        }

        // Check password
        const isValid = await bcrypt.compare(credentials.password, user.password_hash || '');
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Check if user exists in our database
        const [existingUser] = await sql`
          select id, email, name, plan
          from app_user
          where email = ${user.email}
          limit 1
        ` as any[];

        if (!existingUser) {
          // Create new user for Google OAuth
          const [newUser] = await sql`
            insert into app_user (email, name, plan)
            values (${user.email}, ${user.name || ''}, 'free')
            returning id, email, name, plan
          ` as any[];
          
          user.id = newUser.id;
          (user as any).plan = newUser.plan;
        } else {
          user.id = existingUser.id;
          (user as any).plan = existingUser.plan;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.plan = (user as any).plan;
      }
      
      // Refresh plan from database when session is updated
      if (trigger === 'update' && token.id) {
        const [dbUser] = await sql`
          select plan from app_user where id = ${token.id as string} limit 1
        ` as any[];
        
        if (dbUser) {
          token.plan = dbUser.plan;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

