"use client"
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import Image from 'next/image'


type TicketForm = {
    name : string,
    description : string,
    contact ?: string
    
}

const TicketForm = () => {


    const [files, setFiles] = useState<File[]>([])
    const [existingFiles, setExistingFiles] = useState<File[]>([])
    const [removeExistingFiles, setRemoveExistingFiles] = useState<File[]>([])
    const [imagePreview, setImagePreview] = useState<string[]>([])
    const {register,handleSubmit,reset, formState:{errors}} = useForm<TicketForm>()


    const handleNewFile = (e : React.ChangeEvent<HTMLInputElement>) =>{
        // const files = [...(e.target.files ?? [])];
        const files = Array.from(e.target.files ?? [])
        if(files.length == 0) return;
        setFiles(f => [...f, ...files])
        setImagePreview(prev => [
            ...prev,
            ...files.map(file => URL.createObjectURL(file))
        ])
    }

    const fileSubmit = async (data : TicketForm) =>{
        try {

            const formdata = new FormData()

            if(data.name){
                formdata.append("name" , data.name)
            }
            if(data.description){
                formdata.append("description" , data.description)
            }
            if(data.contact){
                formdata.append("name" , data.description)
            }

            files.forEach((f)=>formdata.append("image",f))

            



            
        } catch (error) {
            
        }
    }

  return (
    <form onSubmit={handleSubmit(fileSubmit)}>
        <div>
        {
            imagePreview && (
                <div className=' flex'>{imagePreview.map((img, idx)=>(<div key={idx}><Image src={img} alt='image previews' width={40} height={40}/></div>))}</div>
            )
        }
            <input 
            type="text" 
            id="name"
            {...register("name",{
                required : "Ticket name is required"
            })}  />
            {
                errors.name && <p role='alert'>{errors.name.message}</p>
            }
        </div>
        <div>
            <textarea
            id="description"
            {...register("description",{
                required : "Ticket description is required"
            })}  />
            {
                errors.description && <p role='alert'>{errors.description.message}</p>
            }
        </div>
        <div>
            <input
            id="contact"
            {...register("contact")}  />
            {
                errors.description && <p role='alert'>{errors.description.message}</p>
            }
        </div>
        <div>
        <input type="file" onChange={handleNewFile} multiple  accept='image/*'/>
        </div>
        <button type='submit'>submit ticket</button>
    </form>
  )
}

export default TicketForm