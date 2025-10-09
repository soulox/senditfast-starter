import { z } from 'zod';
import { rateLimit, getRateLimitIdentifier, rateLimitResponse, RATE_LIMITS } from '@lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


// Use mock B2 if MOCK_B2=true in env, otherwise use real B2
const useMock = process.env.MOCK_B2 === 'true';
const b2Module = useMock
  ? require('@lib/b2-mock')
  : require('@lib/b2');

const { initMultipartUpload, calculatePartCount } = b2Module;

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive(),
  contentType: z.string().min(1),
});

export async function POST(req: Request) {
  // Apply rate limiting
  const identifier = getRateLimitIdentifier(req);
  if (!rateLimit(`upload:${identifier}`, RATE_LIMITS.upload)) {
    return rateLimitResponse(60);
  }

  try {
    if (useMock) {
      console.log('🧪 [MOCK MODE] Using mock B2 - file will not actually upload');
    }

    const body = await req.json();
    const { fileName, fileSize, contentType } = uploadSchema.parse(body);

    // TODO: Validate user plan limits
    // For now, enforce a 5GB limit for all users
    const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
    if (fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 5GB.' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    // Calculate number of parts (10MB per part)
    const partSize = 10 * 1024 * 1024; // 10MB
    const partCount = calculatePartCount(fileSize, partSize);

    // Initialize multipart upload and get presigned URLs
    const upload = await initMultipartUpload(fileName, fileSize, contentType, partCount);

    return new Response(
      JSON.stringify({
        uploadId: upload.uploadId,
        key: upload.key,
        partUrls: upload.partUrls,
        partSize,
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Upload create error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: error.errors }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to initialize upload' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
