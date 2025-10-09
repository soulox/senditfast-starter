import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

// Lazy initialization to avoid build-time database connection
let sqlInstance: ReturnType<typeof neon> | null = null;

export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(target, prop) {
    if (!sqlInstance) {
      if (!process.env.DATABASE_URL) {
        // During build, DATABASE_URL might not be set
        // Return a mock that won't actually execute
        console.warn('[DB] DATABASE_URL not set, using mock');
        return () => Promise.resolve([]);
      }
      sqlInstance = neon(process.env.DATABASE_URL);
    }
    return (sqlInstance as any)[prop];
  },
  apply(target, thisArg, args) {
    if (!sqlInstance) {
      if (!process.env.DATABASE_URL) {
        console.warn('[DB] DATABASE_URL not set, using mock');
        return Promise.resolve([]);
      }
      sqlInstance = neon(process.env.DATABASE_URL);
    }
    return (sqlInstance as any)(...args);
  }
}) as ReturnType<typeof neon>;
