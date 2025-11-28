/**
 * Cloudflare R2 Storage Client
 * 
 * S3-compatible storage for document uploads
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Validate required environment variables
const requiredEnvVars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME'
] as const;

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`${envVar} environment variable is not set`);
    }
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

/**
 * S3 Client configured for Cloudflare R2
 */
export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

/**
 * Generate a presigned URL for uploading a file to R2
 * 
 * @param fileKey - Unique key for the file in R2
 * @param contentType - MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 900 = 15 minutes)
 * @returns Presigned upload URL
 */
export async function getPresignedUploadUrl(
    fileKey: string,
    contentType: string,
    expiresIn: number = 900
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
        ContentType: contentType,
    });

    return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading a file from R2
 * 
 * @param fileKey - Key of the file in R2
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned download URL
 */
export async function getPresignedDownloadUrl(
    fileKey: string,
    expiresIn: number = 3600
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileKey,
    });

    return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a unique file key for R2 storage
 * 
 * @param checkId - Check UUID
 * @param filename - Original filename
 * @returns Unique file key
 */
export function generateFileKey(checkId: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `checks/${checkId}/${timestamp}-${sanitizedFilename}`;
}
