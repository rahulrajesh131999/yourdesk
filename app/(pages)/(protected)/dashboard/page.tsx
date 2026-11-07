"use client"
import React, { useEffect, useState } from 'react'
import { requireAuth } from '@/lib/auth-guard'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Loading from '@/components/common/Loading'
import { organizationEndpoints } from '@/services/api'



const page = () => {


  const [userOrganization, setUserOrganization] = useState<any>([])

  useEffect(()=>{

    const controller = new AbortController();

   
      (async()=>{
         try {
        const response = await fetch(organizationEndpoints.GET_ORGANIZATION_API,{
        method : "GET",
        signal : controller.signal
      })

      if(!response.ok) throw new Error("Failed to fetch organization")

      const result = await response.json()
      if(result.success){
        setUserOrganization(result.data)
      }

      console.log(result.data)
      } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was cancelled");
      } else {
        console.error(error);
      }
    }

      })()

    return ()=>{
      controller.abort()
    }

  },[])

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
        <button onClick={()=>router.push("dashboard/organization/create-organization")} className='border px-5 py-2 rounded-md cursor-pointer'>new organization</button>
      </div>
      <button onClick={()=>authClient.signOut({
        fetchOptions : {
          onSuccess : () =>{
            router.push("/login")
          }
        }
      })}>signout</button>
      <div>
        {
          userOrganization.map((org:any, id:any)=>(
            <div key={id} className='px-5 py-2 my-4' onClick={()=>router.push(`/dashboard/organization/${org.organizationId}`)}>
              <p>{org?.organization?.name}</p>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default page