"use client"
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setEditTicket,setTicketDetails } from '@/slices/ticketSlice'
import { ticketEndpoints } from '@/services/api'
import { useAppDispatch, useAppSelector } from '@/redux/hook'

import Image from 'next/image'


type TicketForm = {
    name : string,
    description : string,
    contact ?: string,
    image ?: File
    
}

type Image = {
    image : File,
    preview : string
}

const TicketForm = (organizationID:{organizationID:string}) => {

    const {ticketEdit, ticketDetails} = useAppSelector(state=>state.ticket)

    const organizationId = organizationID.organizationID


    const [files, setFiles] = useState<Image[]>([])
    const [existingFiles, setExistingFiles] = useState<File[]>([])
    const [removeExistingFiles, setRemoveExistingFiles] = useState<File[]>([])
    const [imagePreview, setImagePreview] = useState<string[]>([])
    const {register,handleSubmit,reset, formState:{errors}} = useForm<TicketForm>()



    useEffect(()=>{

    },[])


    const handleNewFile = (e : React.ChangeEvent<HTMLInputElement>) =>{
        // const files = [...(e.target.files ?? [])];
        const files = Array.from(e.target.files ?? [])
        if(files.length == 0) return;
        const newFiles = files.map(file =>({
            image : file,
            preview : URL.createObjectURL(file)
        }))

        setFiles(prev=> [...prev, ...newFiles])

        e.target.value=""
        /* setImagePreview(prev => [
            ...prev,
            ...files.map(file => URL.createObjectURL(file))
        ]) */
    }

/*     const onchangeHandler = async(e:ChangeEvent<HTMLInputElement>) =>{
        const images = Array.from(e.target.files ?? []) 

        console.log("images")

        if(images.length == 0) return

        for(const img of images){
            const imageURL = URL.createObjectURL(img)
            console.log(imageURL)
            setImagePreview(f=>[...f, imageURL])
        }

    } */

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

            formdata.append("organizationId", organizationId)

            if(files.length > 5){
                console.error("image length should not be greater than 5")
                return
            }

            files.forEach((f)=>formdata.append("image",f.image))



            const METHOD = ticketEdit ? "PATCH" : "POST"

            const ENDPOINT = ticketEdit ? ticketEndpoints.EDIT_TICKET("1") : ticketEndpoints.CREATE_NEW_TICKET



            const response = await fetch(ENDPOINT,{
                method : METHOD,
                credentials : "include",
                body : formdata
            })

            if(!response.ok){
                throw new Error("Ticket creation/updation error")
            }

            const result = await response.json()

            console.log("printing ticket result", result)

        } catch (error) {
            console.log("failed to create/update ticket", error)
            return
            
        }
    }

  return (
    <form onSubmit={handleSubmit(fileSubmit)}>
        <div>
  {/*       {
            imagePreview && (
                <div className=' flex'>{imagePreview.map((img, idx)=>(<div key={idx}><Image src={img} alt='image previews' width={40} height={40}/></div>))}</div>
            )
        } */}
        {files.map((img, idx) => (
        <div key={idx}>
            <Image
                src={img.preview}
                alt="Image preview"
                width={80}
                height={80}
            />
        </div>
    ))}
         </div>
         {/* <div>
            <input type="file" 
            
            disabled = {files.length + existingFiles.length >= 5}
            id='image' 
            {
                ...register("image",)
            }

            onChange={handleNewFile}
            />
            {
                errors.name && <p role='alert'>{errors.image?.message}</p>
            }
         </div> */}
         <div>
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
        <input type="file" onChange={handleNewFile} multiple  accept='image/*'disabled={files.length + existingFiles.length >= 5}/>
        </div>
        <button type='submit'>submit ticket</button>
    </form>
  )
}

export default TicketForm