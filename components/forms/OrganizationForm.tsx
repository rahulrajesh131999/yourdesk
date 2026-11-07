"use client"
import React, { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { organizationEndpoints } from '@/services/api'
import { useAppSelector } from '@/redux/hook'


type FormValues = {
  name : string,
  slug : string
}

const OrganizationForm = () => {
  
  const {register, handleSubmit, reset, setValue, getValues, formState:{errors}} = useForm<FormValues>()

  const {editOrganization, organizationDetails } = useAppSelector((state:any)=>state.organization)

  

  useEffect(()=>{
    if(editOrganization && organizationDetails){
      const {name, slug} = organizationDetails
      reset({
        name,
        slug
      })
    }
  },[editOrganization, organizationDetails, reset])


const submitHandler: SubmitHandler<FormValues> = async (data) => {
  try {
    const formdata = new FormData();

    if (data.name) {
      formdata.append("name", data.name);
    }

    if (data.slug) {
      formdata.append("slug", data.slug.trim());
    }

    const endpoint = editOrganization && organizationDetails.id ? organizationEndpoints.UPDATE_ORGANIZATION_API(organizationDetails.id) : organizationEndpoints.CREATE_ORGANIZATION_API
    const method = editOrganization && organizationDetails.id ? "PUT" : "POST"

    const response = await fetch(
      endpoint,
      {
        method: method,
        body: formdata,
      }
    );

    const result = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", result);

  } catch (error) {
    console.error("Request failed:", error);
  }
};  

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className='flex flex-col gap-5'>
        <label htmlFor="name">Organization name</label>
        <input 
        id='name'
        {...register("name",{
          required : "organization name is required"
        })}
        />
        {errors.name && <p role='alert'>{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="slug">Organization URL / </label>
        <input id='slug'
        {...register("slug",{
          required : "url is required",
          validate : value => value.trim().length >0 || "URL cannot contain only spaces"
        })}
        
        />
        {errors.slug && <p role='alert'>{errors.slug.message}</p>}
      </div>
        <button type='submit'>{editOrganization ? "Edit organization" : "Create Organization"}</button>
    </form>
  )
}

export default OrganizationForm