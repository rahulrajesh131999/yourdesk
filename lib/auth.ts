import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
    database : drizzleAdapter(db, {
        provider : "pg"
    }),
    user : {
        additionalFields : {
            role : {
                type : "string",
                required : true,
                defaultValue : "customer",
                input : false

            }
        }
    },
    emailAndPassword : {
        enabled : true
    },
    socialProviders : {
        google : {
            clientId : process.env.GOOGLE_CLIENT_ID! as string,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET! as string
        }
    },
    plugins : [
        admin({
            defaultRole : "customer",
            adminRoles : ["admin"]
        })
    ]
})
