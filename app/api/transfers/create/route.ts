import { sql } from '@lib/db';
import { requireUser } from '@lib/get-user';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { rateLimit, getRateLimitIdentifier, rateLimitResponse, RATE_LIMITS } from '@lib/rate-limit';

const transferCreateSchema = z.object({
  files: z.array(
    z.object({
      b2_key: z.string(),
      name: z.string(),
      size_bytes: z.number().positive(),
      content_type: z.string().optional(),
    })
  ).min(1, 'At least one file is required'),
  expiresAt: z.string().datetime().optional(),
  password: z.string().min(4).optional(),
});

function slug() {
  const a = crypto.getRandomValues(new Uint8Array(16));
  // @ts-ignore
  return Buffer.from(a).toString('base64url');
}

export async function POST(req: Request) {
  // Apply rate limiting
  const identifier = getRateLimitIdentifier(req);
  if (!rateLimit(`transfer-create:${identifier}`, RATE_LIMITS.api)) {
    return rateLimitResponse(60);
  }

  try {
    // Require authentication
    const user = await requireUser();
    const userId = (user as any).id;
    const userPlan = (user as any).plan || 'FREE';

    const body = await req.json();
    const { files, expiresAt, password } = transferCreateSchema.parse(body);

    const total = files.reduce((n: number, f) => n + f.size_bytes, 0);
    const s = slug();

    // Plan-based limits
    const planLimits = {
      FREE: {
        maxSize: 5 * 1024 * 1024 * 1024, // 5 GB
        expiryDays: 7,
        monthlyTransfers: 10,
        passwordProtection: false
      },
      PRO: {
        maxSize: 100 * 1024 * 1024 * 1024, // 100 GB
        expiryDays: 30,
        monthlyTransfers: -1, // unlimited
        passwordProtection: true
      },
      BUSINESS: {
        maxSize: 250 * 1024 * 1024 * 1024, // 250 GB
        expiryDays: 90,
        monthlyTransfers: -1, // unlimited
        passwordProtection: true
      }
    };

    const limits = planLimits[userPlan as keyof typeof planLimits] || planLimits.FREE;

    // Check size limit
    if (total > limits.maxSize) {
      const maxSizeGB = limits.maxSize / (1024 * 1024 * 1024);
      return new Response(
        JSON.stringify({ 
          error: `Transfer size exceeds your plan limit of ${maxSizeGB} GB. Please upgrade your plan.` 
        }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    // Check monthly transfer limit for FREE plan
    if (limits.monthlyTransfers > 0) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [{ count }] = await sql`
        select count(*)::int as count
        from transfer

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

        where owner_id = ${userId}
        and created_at >= ${startOfMonth.toISOString()}
      ` as any[];

      if (count >= limits.monthlyTransfers) {
        return new Response(
          JSON.stringify({ 
            error: `You've reached your monthly limit of ${limits.monthlyTransfers} transfers. Please upgrade to Pro for unlimited transfers.` 
          }),
          { status: 400, headers: { 'content-type': 'application/json' } }
        );
      }
    }

    // Check password protection availability
    if (password && !limits.passwordProtection) {
      return new Response(
        JSON.stringify({ 
          error: 'Password protection is only available on Pro and Business plans. Please upgrade your plan.' 
        }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    // Hash password if provided
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    // Calculate expiration date based on plan
    const expirationDate = expiresAt 
      ? new Date(expiresAt) 
      : new Date(Date.now() + limits.expiryDays * 24 * 60 * 60 * 1000);

    // Create transfer
    const [t] = await sql`
      insert into transfer (slug, owner_id, expires_at, total_size_bytes, status, password_hash)
      values (${s}, ${userId}, ${expirationDate.toISOString()}, ${total}, 'ACTIVE', ${passwordHash})
      returning id, slug, expires_at
    ` as any[];

    // Insert file objects
    for (const f of files) {
      await sql`
        insert into file_object (transfer_id, b2_key, name, size_bytes, content_type)
        values (${t.id}, ${f.b2_key}, ${f.name}, ${f.size_bytes}, ${f.content_type || null})
      `;
    }

    return new Response(JSON.stringify({ id: t.id, slug: t.slug, expires_at: t.expires_at }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    console.error('Transfer create error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid data', details: error.errors }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Failed to create transfer' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
