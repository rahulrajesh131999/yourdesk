"use client"
import React from 'react'
import { useForm } from 'react-hook-form'


type FormValues = {
  name : string,
  slug : string
}

const OrganizationForm = () => {

  const {register, handleSubmit, formState:{errors}} = useForm<FormValues>()


  const submitHandler = async(data:FormValues) =>{

  }

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
        <button>Create organization</button>
    </form>
  )
}

export default OrganizationForm