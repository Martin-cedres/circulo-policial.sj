import { neon } from '@neondatabase/serverless';

export const getSql = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in .env.local');
  }
  return neon(process.env.DATABASE_URL);
};
