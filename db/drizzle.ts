import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import {relations} from "@/db/schema"



const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, relations})