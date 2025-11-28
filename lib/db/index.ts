/**
 * Database Connection Configuration
 * 
 * Neon Serverless Postgres with Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Create Neon connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Export schema for use in queries
export { schema };
