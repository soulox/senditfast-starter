import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, GetObjectCommand, DeleteObjectCommand, ListObjectVersionsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT!,
  region: process.env.B2_REGION || 'us-west-004',
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});

export interface MultipartUploadInit {
  uploadId: string;
  key: string;
  partUrls: string[];
}

/**
 * Initialize a multipart upload and generate presigned URLs for each part
 */
export async function initMultipartUpload(
  fileName: string,
  fileSize: number,
  contentType: string,
  partCount: number
): Promise<MultipartUploadInit> {
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
  const bucket = process.env.B2_BUCKET!;

  // Start multipart upload
  const createCommand = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const { UploadId } = await s3Client.send(createCommand);
  if (!UploadId) throw new Error('Failed to initialize multipart upload');

  // Generate presigned URLs for each part
  const partUrls: string[] = [];
  for (let partNumber = 1; partNumber <= partCount; partNumber++) {
    const uploadPartCommand = new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      UploadId,
      PartNumber: partNumber,
    });

    const presignedUrl = await getSignedUrl(s3Client, uploadPartCommand, {
      expiresIn: 3600, // 1 hour
    });
    partUrls.push(presignedUrl);
  }

  return {
    uploadId: UploadId,
    key,
    partUrls,
  };
}

/**
 * Complete a multipart upload
 */
export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
): Promise<void> {
  const bucket = process.env.B2_BUCKET!;

  const completeCommand = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
    },
  });

  await s3Client.send(completeCommand);
}

/**
 * Abort a multipart upload
 */
export async function abortMultipartUpload(
  key: string,
  uploadId: string
): Promise<void> {
  const bucket = process.env.B2_BUCKET!;

  const abortCommand = new AbortMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
  });

  await s3Client.send(abortCommand);
}

/**
 * Generate a presigned download URL
 */
export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const bucket = process.env.B2_BUCKET!;

  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, getCommand, { expiresIn });
}

/**
 * Calculate the number of parts needed for multipart upload
 * B2 requires parts to be at least 5MB (except the last part)
 */
export function calculatePartCount(fileSize: number, partSize: number = 10 * 1024 * 1024): number {
  return Math.ceil(fileSize / partSize);
}

/**
 * Delete a file from B2 (including all versions)
 */
export async function deleteFile(key: string): Promise<void> {
  const bucket = process.env.B2_BUCKET!;

  console.log(`[B2] Deleting file from bucket "${bucket}": ${key}`);

  try {
    // First, list all versions of this file
    const listCommand = new ListObjectVersionsCommand({
      Bucket: bucket,
      Prefix: key,
    });

    const versions = await s3Client.send(listCommand);
    console.log(`[B2] Found ${(versions.Versions || []).length} versions for ${key}`);

    // Delete all versions
    const deletePromises = (versions.Versions || []).map(version => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
        VersionId: version.VersionId,
      });
      return s3Client.send(deleteCommand);
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`[B2] Successfully deleted ${deletePromises.length} versions of: ${key}`);
    } else {
      console.log(`[B2] No versions found for: ${key}`);
    }
  } catch (error) {
    console.error(`[B2] Failed to delete file "${key}":`, error);
    throw error;
  }
}

/**
 * Delete multiple files from B2
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  console.log(`[B2] Deleting ${keys.length} files from B2`);
  const results = await Promise.allSettled(keys.map(key => deleteFile(key)));
  
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    console.error(`[B2] Failed to delete ${failures.length} out of ${keys.length} files`);
    failures.forEach((f, i) => {
      if (f.status === 'rejected') {
        console.error(`[B2] Failure ${i + 1}:`, f.reason);
      }
    });
  } else {
    console.log(`[B2] Successfully deleted all ${keys.length} files`);
  }
}

