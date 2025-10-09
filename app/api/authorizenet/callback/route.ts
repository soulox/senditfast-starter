import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@lib/db';


export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const transId = searchParams.get('transId');
    const responseCode = searchParams.get('responseCode');
    
    // responseCode: 1 = Approved, 2 = Declined, 3 = Error, 4 = Held for Review
    if (responseCode === '1' && transId) {
      // Payment successful
      console.log(`[Authorize.Net] Payment successful: Transaction ID ${transId}`);
      
      // Redirect to success page
      return NextResponse.redirect(
        new URL('/dashboard?upgraded=true', process.env.NEXT_PUBLIC_BASE_URL || req.url)
      );
    } else {
      // Payment failed or cancelled
      console.log(`[Authorize.Net] Payment failed or cancelled: Response code ${responseCode}`);
      
      // Redirect to pricing page with error
      return NextResponse.redirect(
        new URL('/pricing?error=payment_failed', process.env.NEXT_PUBLIC_BASE_URL || req.url)
      );
    }
  } catch (error) {
    console.error('[Authorize.Net Callback] Error:', error);
    return NextResponse.redirect(
      new URL('/pricing?error=callback_error', process.env.NEXT_PUBLIC_BASE_URL || req.url)
    );
  }
}

export async function POST(req: NextRequest) {
  // Handle POST callback (some implementations use POST)
  return GET(req);
}
