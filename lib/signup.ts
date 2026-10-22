import {authClient} from "@/lib/auth-client"

const {data, error} = await authClient.signUp.email({
    email : "",
    password : "",
    name : "",
    image : "",
    callbackURL : "/dashboard"
},
{
    onRequest : (ctx) =>{
        // Show loading
    },
    onSuccess : (ctx) => {

    },
    onError : (ctx) => {
        
    }
})