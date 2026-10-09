import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

if(!process.env.DATABASE_URL) throw new Error('database_url is required');

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);