"use client"
import React, { useState } from 'react'
import Image from 'next/image'

import google_logo from "@/public/google-svgrepo-com.svg"
import {credentials} from "@/lib/signup"
import { router } from 'better-auth/api'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

const page = () => {

  const [form, setForm] = useState({
    fullName : "",
    email : "",
    password : "",
    confirmPassword : ""

  })

  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const updateForm = (e:React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev)=>({
      ...prev,
      [e.target.name] : e.target.value
    }))
  }

  const verifyPassword = () =>{
    const {password, confirmPassword } = form

    if(password != confirmPassword){
      return "passowrds does not match"
    }

    if(password.length < 6){
      return "password length should be greater than 6"
    }

    return ""
  }


  const Handlesubmit = async (e : React.SubmitEvent) =>{
    
    e.preventDefault();

    const validationError = verifyPassword()

    if(validationError){
      return validationError
    }

    setLoading(true)

    try {
      const {data, error} = await credentials({fullName:form.fullName, email: form.email, password: form.password})

      if(error){
        setError(error.message || "Signup failed")
        router.refresh()
      }

      if(data){
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
     setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

  }

  const googleAuth = async() =>{

    const data = await authClient.signIn.social({
      provider : "google",
      callbackURL : "/dashboard"
    })

  }

  return (
    <div className='flex flex-col h-screen items-center justify-center gap-6'>
      <div className='flex flex-col items-center'>
        <h1 className='font-bold text-4xl'>YD</h1>
        <h3 className='text-gray-500 font-semibold'>Welcome to YourDesk</h3>
      </div>
      <button onClick={googleAuth} className='rounded-md px-1 py-1.5 cursor-pointer w-[20%] flex bg-white items-center justify-center gap-1 text-black'><span><Image src={google_logo} alt='logo' className='h-6 w-6'/></span>Continue with Google</button>
      <div className='flex items-center justify-center gap-2'>
        <div className='border w-28 border-gray-800'></div>
        <p>OR</p>
        <div className='border w-28 border-gray-800'></div>
      </div>
      <form onSubmit={Handlesubmit} className='flex flex-col items-center gap-2.5 w-full'>
        <input type="text" placeholder='Enter your email...' 
        name='email'
        value={form.fullName}
        onChange={updateForm}
        className='border-white border rounded-sm py-1.5 pl-2 pr-14 focus:outline-none'/>
        <input type="text" placeholder='Enter your email...' 
        name='email'
        value={form.email}
        onChange={updateForm}
        className='border-white border rounded-sm py-1.5 pl-2 pr-14 focus:outline-none'/>
        <input type="text" placeholder='Enter your email...' 
        name='email'
        value={form.password}
        onChange={updateForm}
        className='border-white border rounded-sm py-1.5 pl-2 pr-14 focus:outline-none'/>
        <input type="text" placeholder='Enter your email...' 
        name='email'
        value={form.confirmPassword}
        onChange={updateForm}
        className='border-white border rounded-sm py-1.5 pl-2 pr-14 focus:outline-none'/>
        <input type="text" placeholder='Enter your email...' 
        name='email'
        value={form.email}
        onChange={updateForm}
        className='border-white border rounded-sm py-1.5 pl-2 pr-14 focus:outline-none'/>
        <button className='rounded-md px-1 py-1.5 cursor-pointer w-[20%] bg-white text-black' type='submit'>Continue</button>
      </form>
    </div>
  )
}

export default page