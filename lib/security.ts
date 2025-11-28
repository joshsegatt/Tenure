/**
 * AES-256-GCM Encryption Utilities
 * 
 * CRITICAL: All PII (Personally Identifiable Information) must be encrypted
 * before storage in Neon DB (Free tier has no native encryption at rest).
 * 
 * Format: IV:CipherText:AuthTag (all hex-encoded)
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment variable
 * Must be a 32-byte (64 hex characters) string
 */
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    if (key.length !== KEY_LENGTH * 2) {
        throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH * 2} hex characters (${KEY_LENGTH} bytes)`);
    }

    return Buffer.from(key, 'hex');
}

/**
 * Encrypt plaintext using AES-256-GCM
 * 
 * @param text - Plaintext to encrypt
 * @returns Encrypted string in format: IV:CipherText:AuthTag (hex-encoded)
 * @throws Error if encryption fails
 */
export function encrypt(text: string): string {
    try {
        const key = getEncryptionKey();
        const iv = randomBytes(IV_LENGTH);

        const cipher = createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Format: IV:CipherText:AuthTag
        return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
        throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * 
 * @param encryptedText - Encrypted string in format: IV:CipherText:AuthTag
 * @returns Decrypted plaintext
 * @throws Error if decryption or authentication fails
 */
export function decrypt(encryptedText: string): string {
    try {
        const key = getEncryptionKey();
        const parts = encryptedText.split(':');

        if (parts.length !== 3) {
            throw new Error('Invalid encrypted text format. Expected IV:CipherText:AuthTag');
        }

        const [ivHex, encryptedHex, authTagHex] = parts;

        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        if (iv.length !== IV_LENGTH) {
            throw new Error(`Invalid IV length: ${iv.length}, expected ${IV_LENGTH}`);
        }

        if (authTag.length !== AUTH_TAG_LENGTH) {
            throw new Error(`Invalid auth tag length: ${authTag.length}, expected ${AUTH_TAG_LENGTH}`);
        }

        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    } catch (error) {
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Encrypt a JSON object
 * 
 * @param data - Object to encrypt
 * @returns Encrypted string
 */
export function encryptJSON<T>(data: T): string {
    return encrypt(JSON.stringify(data));
}

/**
 * Decrypt to a JSON object
 * 
 * @param encryptedText - Encrypted string
 * @returns Decrypted object
 */
export function decryptJSON<T>(encryptedText: string): T {
    const decrypted = decrypt(encryptedText);
    return JSON.parse(decrypted) as T;
}
