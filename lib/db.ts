import { neon } from '@neondatabase/serverless';

// Note: fetchConnectionCache is now always true by default (deprecated option)

// Lazy initialization to avoid build-time database connection
let sqlInstance: ReturnType<typeof neon> | null = null;

const ensureInstance = () => {
  if (!sqlInstance) {
    if (!process.env.DATABASE_URL) {
      console.warn('[DB] DATABASE_URL not set, using mock');
      return null;
    }
    sqlInstance = neon(process.env.DATABASE_URL);
  }
  return sqlInstance;
};

const noop = ((..._args: any[]) => Promise.resolve([])) as unknown as ReturnType<typeof neon>;

export const sql = new Proxy(noop, {
  get(_target, prop) {
    const instance = ensureInstance();
    if (!instance) {
      return () => Promise.resolve([]);
    }
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  apply(_target, _thisArg, args) {
    const instance = ensureInstance();
    if (!instance) {
      return Promise.resolve([]);
    }
    return (instance as any)(...args);
  },
}) as ReturnType<typeof neon>;
