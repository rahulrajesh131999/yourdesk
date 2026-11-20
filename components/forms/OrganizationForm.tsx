"use client"
import React, { ChangeEvent, ReactHTMLElement, useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { organizationEndpoints } from '@/services/api'
import { useAppSelector } from '@/redux/hook'
import Image from 'next/image'
import close from "@/public/close-circle-svgrepo-com.svg"
import { industries, type Industry } from '@/constants/industry'


type FormValues = {
  name : string,
  slug : string,
  industry : string,
  tagline ?: string,
  image : File | null
}

const OrganizationForm = () => {
  
  const {register, handleSubmit, reset, setValue, getValues, formState:{errors}} = useForm<FormValues>()

  const {editOrganization, organizationDetails } = useAppSelector((state:any)=>state.organization)

  const [imagePreview, setImagePreview] = useState<string | null>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [industry, setIndustry] = useState<string>("")

    const imageUrlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)


  // image registration
  const {ref: registerImageRef,
         onChange:registerImageOnChange,
        ...imageRegister} = register("image")

  const clearImagePreview = () => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current)
      imageUrlRef.current = null
    }
  }

  

  useEffect(()=>{

    clearImagePreview()
    
    if(editOrganization && organizationDetails){
      const {name, slug, image, tagline, industry } = organizationDetails
      
      reset({
        name,
        slug,
        tagline,
        industry,
        image : null
      })
      setImagePreview(image || null)
    }else{
      reset({
      name: "",
      slug: "",
      tagline : "",
      industry : "",
      image: null
    })

    setImagePreview(null)
    }
    
  },[editOrganization, organizationDetails, reset])

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current)
      }
    }
  }, [])

/*   const {
  onChange: registerImageOnChange,
  ...imageRegister
} = register("image") */

  const imageChangeHandler = async(e:ChangeEvent<HTMLInputElement>) =>{

    registerImageOnChange(e)
    const img =  e.target.files?.[0]

    if(!img) return

    clearImagePreview()

    const imgUrl = URL.createObjectURL(img)
    console.log(imgUrl)

    imageUrlRef.current = imgUrl
    console.log("imageurl",imageUrlRef)

    setImagePreview(imgUrl)
    /* setValue("image", img) */
  }

    // Remove image
  const removeImageHandler = () => {

    clearImagePreview()

    setImagePreview(null)

    setValue("image", null, {
      shouldDirty: true,
      shouldValidate: true
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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

    if(data.tagline){
      formdata.append("description",data.tagline)
    }

    if(data.image instanceof File){
      formdata.append("image", data.image)
    }

    if(data.industry){
      formdata.append("industry", data.industry)
    }

     const isEditing = editOrganization && organizationDetails?.id

    

    const endpoint = isEditing ? organizationEndpoints.UPDATE_ORGANIZATION_API(organizationDetails.id) : organizationEndpoints.CREATE_ORGANIZATION_API
    const method = isEditing ? "PUT" : "POST"

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

/* const removeImageHandler = (e:React.MouseEvent<HTMLImageElement>) =>{
  setImagePreview(null)
  setValue("image", null)
} */


  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div>
        {
          imagePreview && (
            <div className='relative inline-block '>
              <Image src={close} alt='close logo' width={20} height={20} className='absolute -top-2 -right-2' id='removeImage' onClick={removeImageHandler} />
              <Image src={imagePreview} alt='logo' width={100} height={100} unoptimized />
            </div>
          )
        }
      </div>
      <div className='flex flex-col gap-5'>
        <label htmlFor="image">Organization logo</label>
        <input 
        type="file"
        id='image'
        accept='image/*'
        {...imageRegister}
        ref={(element)=>{
          registerImageRef(element)
          fileInputRef.current = element
        }}
        onChange={imageChangeHandler}
        />
      </div>
      <div className='flex flex-col gap-5'>
        <label htmlFor="name">Organization name</label>
        <input 
        id='name'
        {...register("name",{
          required : "organization name is required",
          validate: value =>
              value.trim().length > 0 ||
              "Organization name cannot contain only spaces"
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
      <div>
        {/* <label htmlFor="industry">select industry</label> */}
        {/* <select name="industry" id="industry" onChange={(e)=>setIndustry(e.target.value)}> */}
        <select id="industry" {...register("industry",{
          required : "select industry"
        })}>
          <option value="" disabled>
    Select industry
  </option>
          {
            industries.map((industry)=>(
              <option key={industry} value={industry}>{industry}</option>
            ))
          }
        </select>
        {
          errors.industry && <p role='alert'>{errors.industry.message}</p>
        }
      </div>
      <div>
        <label htmlFor="tagline">tagline</label>
        <input id='tagline'
        {...register("tagline")}
        
        />
        {errors.tagline && <p role='alert'>{errors.tagline.message}</p>}
      </div>
        <button type='submit'>{editOrganization ? "Edit organization" : "Create Organization"}</button>
    </form>
  )
}

export default OrganizationForm