import {config} from "dotenv";
import {drizzle} from 'drizzle-orm/neon-http';

import {relations} from "@/db/schema"

config({path:".env"})

export const db = drizzle(process.env.DATABASE_URL!, {
    relations
})