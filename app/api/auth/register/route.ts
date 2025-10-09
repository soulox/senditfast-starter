import { sql } from '@lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { rateLimit, getRateLimitIdentifier, rateLimitResponse, RATE_LIMITS } from '@lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  // Apply rate limiting
  const identifier = getRateLimitIdentifier(req);
  if (!rateLimit(`register:${identifier}`, RATE_LIMITS.auth)) {
    return rateLimitResponse(900); // 15 minutes
  }

  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user exists
    const [existing] = await sql`
      select id from app_user where email = ${email} limit 1
    ` as any[];

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await sql`
      insert into app_user (email, password_hash, name, plan)
      values (${email}, ${passwordHash}, ${name || null}, 'FREE')
      returning id, email, name, plan, created_at
    ` as any[];

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        },
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid data', details: error.errors }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Registration failed' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

