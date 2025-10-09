import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse FormData from request
    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    const partUrl = formData.get('partUrl') as string;
    const partNumber = parseInt(formData.get('partNumber') as string);
    const uploadId = formData.get('uploadId') as string;
    const key = formData.get('key') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!partUrl || !partNumber || !uploadId || !key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload the part to B2
    const uploadResponse = await fetch(partUrl, {
      method: 'PUT',
      body: arrayBuffer,
      headers: {
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('B2 upload failed:', uploadResponse.status, errorText);
      throw new Error(`B2 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    const etag = uploadResponse.headers.get('ETag') || `"part-${partNumber}"`;

    return NextResponse.json({
      success: true,
      partNumber,
      etag: etag.replace(/"/g, ''), // Remove quotes from ETag
      uploadId,
      key,
    });

  } catch (error) {
    console.error('Upload part error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
