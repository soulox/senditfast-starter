/**
 * Mock B2 implementation for testing without real credentials
 * Set MOCK_B2=true in .env.local to use this
 */

export interface MultipartUploadInit {
  uploadId: string;
  key: string;
  partUrls: string[];
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function initMultipartUpload(
  fileName: string,
  fileSize: number,
  contentType: string,
  partCount: number
): Promise<MultipartUploadInit> {
  console.log('[MOCK B2] Initializing upload:', { fileName, fileSize, partCount });
  
  // Simulate network delay
  await delay(500);

  const uploadId = `mock-upload-${Date.now()}`;
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${fileName}`;

  // Generate fake presigned URLs
  const partUrls: string[] = [];
  for (let i = 1; i <= partCount; i++) {
    partUrls.push(`https://mock-b2.example.com/upload?uploadId=${uploadId}&partNumber=${i}`);
  }

  return {
    uploadId,
    key,
    partUrls,
  };
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
): Promise<void> {
  console.log('[MOCK B2] Completing upload:', { key, uploadId, partCount: parts.length });
  
  // Simulate network delay
  await delay(300);

  // In mock mode, just log success
  console.log('[MOCK B2] Upload completed successfully!');
}

export async function abortMultipartUpload(
  key: string,
  uploadId: string
): Promise<void> {
  console.log('[MOCK B2] Aborting upload:', { key, uploadId });
  await delay(200);
}

export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  console.log('[MOCK B2] Generating download URL:', { key, expiresIn });
  await delay(100);
  
  // Return a data URL for a sample text file
  return `data:text/plain;base64,${btoa('This is a mock file from B2. Configure real B2 credentials to upload actual files!')}`;
}

export function calculatePartCount(fileSize: number, partSize: number = 10 * 1024 * 1024): number {
  return Math.ceil(fileSize / partSize);
}

export async function deleteFile(key: string): Promise<void> {
  console.log('[MOCK B2] Deleting file:', { key });
  await delay(200);
  console.log('[MOCK B2] File deleted successfully!');
}

export async function deleteFiles(keys: string[]): Promise<void> {
  console.log('[MOCK B2] Deleting multiple files:', { count: keys.length, keys });
  await delay(300);
  console.log('[MOCK B2] All files deleted successfully!');
}

