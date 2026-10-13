import React from 'react'
import Image from 'next/image'

import google_logo from "@/public/google-svgrepo-com.svg"

const page = () => {
  return (
     <div className='flex flex-col h-screen items-center justify-center gap-6'>
      <div className='flex flex-col items-center'>
        <h1 className='font-bold text-4xl'>YD</h1>
        <h3 className='text-gray-500 font-semibold'>Welcome to YourDesk</h3>
      </div>
      <button className='rounded-md px-1 py-1.5 cursor-pointer w-[20%] flex bg-white items-center justify-center gap-1 text-black'><span><Image src={google_logo} alt='logo' className='h-6 w-6'/></span>Continue with Google</button>
      <div className='flex items-center justify-center gap-2'>
        <div className='border w-28 border-gray-800'></div>
        <p>OR</p>
        <div className='border w-28 border-gray-800'></div>
      </div>
      <form className='flex flex-col items-center gap-2.5 w-full'>
        <input type="text" placeholder='Enter your email...' 
        className='border-white border rounded-sm py-1.5 pl-2 pr-14 focus:outline-none'/>
        <button className='rounded-md px-1 py-1.5 cursor-pointer w-[20%] bg-white text-black' type='submit'>Continue</button>
      </form>
    </div>
  )
}

export default page