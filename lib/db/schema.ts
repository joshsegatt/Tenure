/**
 * Drizzle ORM Database Schema
 * 
 * Tables:
 * - users: Clerk user sync
 * - checks: Right-to-rent verification records with encrypted PII
 */

import { pgTable, uuid, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Check status enum
 */
export const checkStatusEnum = pgEnum('check_status', [
    'pending',    // Awaiting tenant upload
    'analyzing',  // Document being processed
    'clear',      // Verification passed
    'rejected'    // Verification failed
]);

/**
 * Users table - Synced with Clerk
 */
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Right-to-rent verification checks
 * 
 * SECURITY NOTE: encryptedPii contains sensitive tenant data encrypted
 * using AES-256-GCM before storage. Never store PII in plaintext.
 */
export const checks = pgTable('checks', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    // Verification status
    status: checkStatusEnum('status').notNull().default('pending'),

    // Encrypted tenant PII (JSONB containing encrypted data)
    // Structure after decryption: { name: string, passportNumber: string, dateOfBirth: string, etc. }
    encryptedPii: jsonb('encrypted_pii').$type<string>(), // Stores encrypted JSON string

    // Cloudflare R2 storage key for uploaded document
    r2FileKey: text('r2_file_key'),

    // Magic link token for tenant access (UUID format)
    magicToken: text('magic_token').notNull().unique(),

    // Landlord notes (optional)
    notes: text('notes'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
    checks: many(checks)
}));

export const checksRelations = relations(checks, ({ one }) => ({
    user: one(users, {
        fields: [checks.userId],
        references: [users.id]
    })
}));

/**
 * Type exports for use in application
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Check = typeof checks.$inferSelect;
export type NewCheck = typeof checks.$inferInsert;
export type CheckStatus = typeof checkStatusEnum.enumValues[number];
