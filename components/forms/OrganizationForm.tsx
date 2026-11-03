"use client"
import React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { organizationEndpoints } from '@/services/api'


type FormValues = {
  name : string,
  slug : string
}

const OrganizationForm = () => {

  const {register, handleSubmit, formState:{errors}} = useForm<FormValues>()


const submitHandler: SubmitHandler<FormValues> = async (data) => {
  try {
    const formdata = new FormData();

    if (data.name) {
      formdata.append("name", data.name);
    }

    if (data.slug) {
      formdata.append("slug", data.slug.trim());
    }

    const response = await fetch(
      organizationEndpoints.CREATE_ORGANIZATION_API,
      {
        method: "POST",
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
          required : "url is required"
        })}
        
        />
        {errors.slug && <p role='alert'>{errors.slug.message}</p>}
      </div>
        <button type='submit'>Create organization</button>
    </form>
  )
}

export default OrganizationForm