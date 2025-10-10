import { neon } from '@neondatabase/serverless';

// Initialize database connection
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);
