"use client"
import TicketForm from '@/components/forms/TicketForm'
import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {

  const params = useParams<{organizationId:string}>()

  const organizationid = params.organizationId
  console.log("printing organizationid", organizationid)

  return (
    <div>
        This is create ticket page
        <TicketForm organizationID={organizationid}/>
    </div>
  )
}

export default page