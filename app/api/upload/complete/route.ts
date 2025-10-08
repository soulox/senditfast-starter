import { z } from 'zod';

// Use mock B2 if MOCK_B2=true in env
const useMock = process.env.MOCK_B2 === 'true';
const { completeMultipartUpload } = useMock
  ? require('@lib/b2-mock')
  : require('@lib/b2');

const completeSchema = z.object({
  uploadId: z.string(),
  key: z.string(),
  parts: z.array(
    z.object({
      PartNumber: z.number(),
      ETag: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uploadId, key, parts } = completeSchema.parse(body);

    // Complete the multipart upload on B2
    await completeMultipartUpload(key, uploadId, parts);

    return new Response(
      JSON.stringify({
        success: true,
        key,
        message: 'Upload completed successfully',
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('Upload complete error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: error.errors }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to complete upload' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
