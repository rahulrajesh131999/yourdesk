import {authClient} from "@/lib/auth-client";


type LoginCredentials = {
    email : string,
    password : string
}

export const loginCredentials = async ({email, password} : LoginCredentials) => {

const {data, error} = await authClient.signIn.email({
    email : email,
    password : password,
    rememberMe : true,
    callbackURL : ""
})

return {data, error}

}