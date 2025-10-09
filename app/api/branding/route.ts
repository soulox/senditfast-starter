import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@lib/get-user';
import { sql } from '@lib/db';
import { z } from 'zod';


const brandingSchema = z.object({
  logo_url: z.string().url().nullable(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  custom_domain: z.string().nullable(),
  company_name: z.string().nullable()
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;
    const userPlan = (user as any).plan || 'FREE';

    // Only allow Business plan users
    if (userPlan !== 'BUSINESS') {
      return NextResponse.json(
        { success: false, error: 'Custom branding is only available on the Business plan' },
        { status: 403 }
      );
    }

    // Get branding settings
    const [branding] = await sql`
      SELECT logo_url, primary_color, secondary_color, custom_domain, company_name
      FROM custom_branding
      WHERE user_id = ${userId}
      LIMIT 1
    ` as any[];

    return NextResponse.json({
      success: true,
      branding: branding || null
    });
  } catch (error: any) {
    console.error('[Branding] Error fetching settings:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch branding settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const userId = (user as any).id;
    const userPlan = (user as any).plan || 'FREE';

    // Only allow Business plan users
    if (userPlan !== 'BUSINESS') {
      return NextResponse.json(
        { success: false, error: 'Custom branding is only available on the Business plan' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const branding = brandingSchema.parse(body);

    // Upsert branding settings
    await sql`
      INSERT INTO custom_branding (
        user_id, logo_url, primary_color, secondary_color, custom_domain, company_name, updated_at
      )
      VALUES (
        ${userId}, ${branding.logo_url}, ${branding.primary_color}, ${branding.secondary_color},
        ${branding.custom_domain}, ${branding.company_name}, NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        logo_url = ${branding.logo_url},
        primary_color = ${branding.primary_color},
        secondary_color = ${branding.secondary_color},
        custom_domain = ${branding.custom_domain},
        company_name = ${branding.company_name},
        updated_at = NOW()
    `;

    console.log(`[Branding] Updated branding for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Branding settings saved'
    });
  } catch (error: any) {
    console.error('[Branding] Error saving settings:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to save branding settings' },
      { status: 500 }
    );
  }
}
