import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { admin } from "better-auth/plugins";
import { UserTable, session, account, verification } from "@/db/schema";
import {config} from "dotenv"

config({path:".env"})

/* console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log(
  "Google Client Secret exists:",
  !!process.env.GOOGLE_CLIENT_SECRET
); */

export const auth = betterAuth({
    database : drizzleAdapter(db, {
        provider : "pg",
        schema: {
      user: UserTable,   // Better Auth expects the key "user"
      session,
      account,
      verification,
    },
    }),
 /*    user : {
        additionalFields : {
            role : {
                type : "string",
                required : true,
                defaultValue : "",
                input : false

            }
        }
    }, */
    emailAndPassword : {
        enabled : true
    },
    socialProviders : {
        google : {
            clientId : process.env.GOOGLE_CLIENT_ID! as string,
            clientSecret : process.env.GOOGLE_CLIENT_SECRET! as string,
            // prompt : "select_account"
        }
    },
/*     plugins : [
        admin({
            defaultRole : "customer",
            adminRoles : ["admin"]
        })
    ] */
})
