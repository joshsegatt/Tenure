/**
 * Server Actions for Check Management
 * 
 * Type-safe server actions with Clerk authentication
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { db, schema } from '@/lib/db';
import { getPresignedUploadUrl, generateFileKey } from '@/lib/storage';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

/**
 * Standard response type for server actions
 */
type ActionResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string };

/**
 * Create a new right-to-rent check
 * 
 * @returns Check ID and magic token for tenant access
 */
export async function createCheck(): Promise<ActionResponse<{
    checkId: string;
    magicToken: string;
    verifyUrl: string;
}>> {
    try {
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Get or create user in database
        let user = await db.query.users.findFirst({
            where: eq(schema.users.clerkId, userId)
        });

        if (!user) {
            const [newUser] = await db.insert(schema.users).values({
                clerkId: userId,
                email: '', // Will be updated via Clerk webhook
            }).returning();
            user = newUser;
        }

        // Generate magic token for tenant access
        const magicToken = randomUUID();

        // Create check record
        const [check] = await db.insert(schema.checks).values({
            userId: user.id,
            magicToken,
            status: 'pending',
        }).returning();

        // Generate verification URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const verifyUrl = `${baseUrl}/verify/${magicToken}`;

        revalidatePath('/dashboard');

        return {
            success: true,
            data: {
                checkId: check.id,
                magicToken: check.magicToken,
                verifyUrl,
            }
        };
    } catch (error) {
        console.error('Create check error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create check'
        };
    }
}

/**
 * Generate presigned upload URL for document upload
 * 
 * @param checkId - Check UUID
 * @param filename - Original filename
 * @param contentType - File MIME type
 */
export async function generateUploadUrl(
    checkId: string,
    filename: string,
    contentType: string
): Promise<ActionResponse<{ uploadUrl: string; fileKey: string }>> {
    try {
        // Verify check exists and get magic token for validation
        const check = await db.query.checks.findFirst({
            where: eq(schema.checks.id, checkId)
        });

        if (!check) {
            return { success: false, error: 'Check not found' };
        }

        // Generate unique file key
        const fileKey = generateFileKey(checkId, filename);

        // Generate presigned URL (15 minute expiry)
        const uploadUrl = await getPresignedUploadUrl(fileKey, contentType);

        // Update check with file key
        await db.update(schema.checks)
            .set({
                r2FileKey: fileKey,
                updatedAt: new Date()
            })
            .where(eq(schema.checks.id, checkId));

        return {
            success: true,
            data: { uploadUrl, fileKey }
        };
    } catch (error) {
        console.error('Generate upload URL error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate upload URL'
        };
    }
}

/**
 * Get check details by magic token (for tenant access)
 * 
 * @param magicToken - Magic token from URL
 */
export async function getCheckByToken(
    magicToken: string
): Promise<ActionResponse<{
    id: string;
    status: string;
    createdAt: Date;
}>> {
    try {
        const check = await db.query.checks.findFirst({
            where: eq(schema.checks.magicToken, magicToken)
        });

        if (!check) {
            return { success: false, error: 'Invalid verification link' };
        }

        return {
            success: true,
            data: {
                id: check.id,
                status: check.status,
                createdAt: check.createdAt,
            }
        };
    } catch (error) {
        console.error('Get check by token error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get check'
        };
    }
}

/**
 * Get all checks for the authenticated user
 */
export async function getUserChecks(): Promise<ActionResponse<Array<{
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    magicToken: string;
}>>> {
    try {
        const { userId } = await auth();

        if (!userId) {
            return { success: false, error: 'Unauthorized' };
        }

        const user = await db.query.users.findFirst({
            where: eq(schema.users.clerkId, userId)
        });

        if (!user) {
            return { success: true, data: [] };
        }

        const checks = await db.query.checks.findMany({
            where: eq(schema.checks.userId, user.id),
            orderBy: (checks, { desc }) => [desc(checks.createdAt)]
        });

        return {
            success: true,
            data: checks.map(check => ({
                id: check.id,
                status: check.status,
                createdAt: check.createdAt,
                updatedAt: check.updatedAt,
                magicToken: check.magicToken,
            }))
        };
    } catch (error) {
        console.error('Get user checks error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get checks'
        };
    }
}
