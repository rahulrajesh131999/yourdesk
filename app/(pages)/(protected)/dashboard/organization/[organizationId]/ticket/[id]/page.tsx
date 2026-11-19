"use client"
import { ticketEndpoints } from '@/services/api';
import { useParams } from 'next/navigation';
import React, { useEffect, use } from 'react'

const page = ({params}:{params:Promise<{id:string}>}) => {

    const {id} = use(params);

    const routeParams = useParams<{organizationId:string, id:string}>()

    const organizationId = routeParams.organizationId
    const ticketId = routeParams.id

    console.log("this is ticket id", ticketId)
    console.log("this is organization id", organizationId)

    useEffect(()=>{

      const controller = new AbortController()

      try {

         const getTicket = async()=>{
          const response = await fetch(ticketEndpoints.GET_TICKET_DETAILS(id),{
            method : "GET",
            credentials : "include",
            body : JSON.stringify(organizationId),
            signal : controller.signal
          })

          if(!response.ok){
            throw new Error("Failed to get ticket details")
          }

          const result = await response.json()

          console.log("printing ticket details",result)
        }
        
      } catch (error) {

        if(error instanceof Error && error.name === "AbortError" ){
          return
        }

        console.error("ticket fetch error", error)
        
      }
      return ()=>{
        controller.abort()
      }

       
    },[organizationId, id])

  return (
    <div>

    </div>
  )
}

export default page