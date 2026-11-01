"use client"
import React from 'react'
import { requireAuth } from '@/lib/auth-guard'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Loading from '@/components/common/Loading'



const page = () => {

    const {data: session, isPending} = authClient.useSession()
    const router = useRouter()

    if(isPending) return(<Loading/>)


  return (
    <div>
    {/*   <h1>{session?.user.name}</h1>
      <button onClick={()=>authClient.signOut({
              fetchOptions : {
                onSuccess : () =>{
                  redirect("/login")
                }
              }
            })}>signout</button> */}
      <div>
      <h1>Hello,</h1>
      <h1 className='ml-5'>{session?.user.name}</h1>
      </div>
      <div className='items-center justify-center flex flex-col gap-2'>
        <h1>Create new organization</h1>
        <button onClick={()=>router.push("/create-organization")} className='border px-5 py-2 rounded-md cursor-pointer'>new organization</button>
      </div>
    </div>
  )
}

export default page