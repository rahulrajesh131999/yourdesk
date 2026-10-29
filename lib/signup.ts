import {authClient} from "@/lib/auth-client"


type UserDetails = {
    fullName: string;
  email: string;
  password: string;
  role?: string
}

export const credentials =async ({fullName , email, password}: UserDetails /* {fullName:string, email:string, password:string} */)=> {

const {data, error} = await authClient.signUp.email({
    email : email,
    password : password,
    name : fullName,
    image : "",
    callbackURL : "/dashboard",
},
/* {
    onRequest : (ctx) =>{
        // Show loading
    },
    onSuccess : (ctx) => {

    },
    onError : (ctx) => {
        
    }
} */)
 return {data, error}
}