// drizzle.config.ts - Drizzle ORM configuration for Supabase
import type { Config } from 'drizzle-kit';

export default {
  schema: './supabase/functions/server/db/schema.ts',
  out: './supabase/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.SUPABASE_DB_URL || '',
  },
  verbose: true,
  strict: true,
} satisfies Config;
