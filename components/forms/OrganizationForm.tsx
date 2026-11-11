"use client"
import React, { ChangeEvent, ReactHTMLElement, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { organizationEndpoints } from '@/services/api'
import { useAppSelector } from '@/redux/hook'
import Image from 'next/image'


type FormValues = {
  name : string,
  slug : string,
  image : File
}

const OrganizationForm = () => {
  
  const {register, handleSubmit, reset, setValue, getValues, formState:{errors}} = useForm<FormValues>()

  const {editOrganization, organizationDetails } = useAppSelector((state:any)=>state.organization)

  const [imagePreview, setImagePreview] = useState<string | null>()

  

  useEffect(()=>{
    if(editOrganization && organizationDetails){
      const {name, slug, image } = organizationDetails
      
      reset({
        name,
        slug,
        image
      })
      setImagePreview(image)
    }
    
  },[editOrganization, organizationDetails, reset])

  const imageChangeHandler = async(e:ChangeEvent<HTMLInputElement>) =>{
    const img =  e.target.files?.[0]

    if(!img) return

    const imgUrl = URL.createObjectURL(img)

    setImagePreview(imgUrl)
  }


const submitHandler: SubmitHandler<FormValues> = async (data) => {
  try {
    const formdata = new FormData();

    if (data.name) {
      formdata.append("name", data.name);
    }

    if (data.slug) {
      formdata.append("slug", data.slug.trim());
    }

    if(data.image){
      formdata.append("image", data.image)
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
      <div>
        {
          imagePreview && (
            <div>
              <Image src={imagePreview} alt='logo' className='h-20 w-20' />
            </div>
          )
        }
      </div>
      <div className='flex flex-col gap-5'>
        <label htmlFor="image">Organization logo</label>
        <input 
        type="file"
        id='image'
        {...register("image")}
        onChange={()=>imageChangeHandler}
        />
      </div>
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