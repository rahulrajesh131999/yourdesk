"use client"
import { authClient } from '@/lib/auth-client'
import { organizationEndpoints } from '@/services/api'
import { useRouter, usePathname,useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {useAppDispatch, useAppSelector} from "@/redux/hook"
import {setEditOrganization, setOrganizationDetails} from "@/slices/organizationSlice"
import OrganizationForm from '@/components/forms/OrganizationForm'

const page = () => {

    const router = useRouter()
    // const pathname = usePathname()

    // const setEditOrganization = useAppSelector(state => state.organization.editOrganization)
    const dispatch = useAppDispatch()
    const params = useParams<{organizationId:string}>()

    const organizationid = params.organizationId

    const [organization, setOrganization] = useState<any>()

    useEffect(()=>{

      const controller = new AbortController()

      const getOrganization = async()=>{
        try {

          const response = await fetch(organizationEndpoints.GET_ORGANIZATION_BY_ID_API(organizationid),{
          method : "GET",
          credentials : "include",
          // body : organizationid
          signal : controller.signal
        })

        if(!response.ok){
          throw new Error("Failed to fetch Organization details")
        }

        const result = await response.json()
        console.log("Printing organization result",result)

        if(result.success){
          setOrganization(result.data)
          dispatch(setOrganizationDetails(result.data))
        dispatch(setEditOrganization(true))
        }
          
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
        return
    }
          console.error("organization fetch error", error)
        }
        
      }

      getOrganization()

      return  ()=> {
        dispatch(setEditOrganization(false))
        controller.abort()

      }
    },[organizationid])



  return (
    <div>
      <h1>Edit Organization : {organization?.name}</h1>
      <OrganizationForm/>
    </div>
  )
}

export default page