"use client"
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setEditTicket,setTicketDetails } from '@/slices/ticketSlice'
import { ticketEndpoints } from '@/services/api'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import close from "@/public/close-circle-svgrepo-com.svg"

import Image from 'next/image'


type TicketForm = {
    name : string,
    description : string,
    contact ?: string | null,
    image ?: File | null
    
}

type Image = {
    image : File | null,
    preview : string,
    isExisting : boolean
}

const TicketForm = (organizationID:{organizationID:string}) => {

    const {ticketEdit, ticketDetails} = useAppSelector((state:any)=>state.ticket)

    console.log("printing ticket details ticketform", ticketDetails)
    console.log("printing ticketedit status", ticketEdit)

    const organizationId = organizationID.organizationID


    const [files, setFiles] = useState<Image[]>([])
    // const [existingFiles, setExistingFiles] = useState<File[]>([])
    const [removeExistingFiles, setRemoveExistingFiles] = useState<string[]>([])
    const [imagePreview, setImagePreview] = useState<string[]>([])
    const {register,handleSubmit,reset, formState:{errors}} = useForm<TicketForm>()

    const imageInputRef = useRef<HTMLInputElement| null>(null)
    // const imageUrlRef = useRef<string[]>([])



    useEffect(()=>{

        if(ticketEdit && ticketDetails){
            const {name, description, contact, images } = ticketDetails

            reset({
                name,
                description,
                contact
            })
            console.log("printing image files",images)
            if(images && images.length > 0){
                setFiles(
                    images.map((img:any)=>({
                        image : null,
                        preview : img.url,
                        isExisting : true
                    }))
                )
            }
        }else{
            reset({
                name : "",
                description : "",
                contact : null
            })
        }

    },[ticketEdit, ticketDetails, reset])

    useEffect(() => {
    return () => {
        files.forEach(file => {
            if (!file.isExisting) {
                URL.revokeObjectURL(file.preview)
            }
        })
    }
}, [files])




    const handleNewFile = (e : React.ChangeEvent<HTMLInputElement>) =>{
        // const files = [...(e.target.files ?? [])];
        const files = Array.from(e.target.files ?? [])
        if(files.length == 0) return;
        const newFiles = files.map(file =>({
            image : file,
            preview : URL.createObjectURL(file),
            isExisting : false
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
                formdata.append("contact" , data.contact)
            }

            formdata.append("organizationId", organizationId)

            if(ticketEdit){
                formdata.append("removeImageIds",JSON.stringify(removeExistingFiles))
            }

            if(files.length > 5){
                console.error("image length should not be greater than 5")
                return
            }
            if(files && files.length > 0){
                files.forEach((f)=>{
                    if(f.image instanceof File){
                        formdata.append("images",f.image)
                    }
                }
            )
            }
            




            const METHOD = ticketEdit ? "PATCH" : "POST"

            const ENDPOINT = ticketEdit ? ticketEndpoints.EDIT_TICKET(ticketDetails.id) : ticketEndpoints.CREATE_NEW_TICKET



            const response = await fetch(ENDPOINT,{
                method : METHOD,
                credentials : "include",
                body : formdata
            })
            const result = await response.json()

            if(!response.ok){
                throw new Error(result.message)
            }


            console.log("printing ticket result", result)

        } catch (error) {
            console.log("failed to create/update ticket", error)
            return
            
        }
    }

    const removeImageHandler = (img:Image, idx:number) =>{
        if(img.isExisting){
            setRemoveExistingFiles((prev)=>[...prev, img.preview])
            setFiles((prev)=>(
                prev.filter((p)=>p.preview != img.preview)
            )) 
            console.log("printing remove images",removeExistingFiles)
        }else if(!img.isExisting){
            URL.revokeObjectURL(img.preview)
            setFiles((prev)=>(
                prev.filter((_,index)=> index != idx)
            ))
            if(imageInputRef.current){
                imageInputRef.current.value = ''
            }
        }
    }

  return (
    <form onSubmit={handleSubmit(fileSubmit)}>
        <div className='flex gap-2'>
  {/*       {
            imagePreview && (
                <div className=' flex'>{imagePreview.map((img, idx)=>(<div key={idx}><Image src={img} alt='image previews' width={40} height={40}/></div>))}</div>
            )
        } */}
        {files.map((img, idx) => (
        <div className='relative inline-block ' key={idx}>
            <Image
                src={img.preview}
                alt="Image preview"
                width={80}
                height={80}
                
            />
            <button
            type='button'
            onClick={()=>removeImageHandler(img, idx)}
            >

            <Image
            src={close}
            alt='close logo'
            width={15}
            height={15}
            className='absolute -top-2 -right-2'
            
            />
            </button>

        </div>
    ))}
         </div>
         {/* <div>
            <input type="file" 
            
            disabled = {files.length >=5}
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
            placeholder='name'
            {...register("name",{
                required : "Ticket name is required",  
            })}  />
            {
                errors.name && <p role='alert'>{errors.name.message}</p>
            }
            </div>
       
        <div>
            <textarea
            id="description"
            placeholder='description'
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
            placeholder='contact'
            {...register("contact")}  />
            {
                errors.contact && <p role='alert'>{errors.contact.message}</p>
            }
        </div>
        <div>
        <input type="file"  name="image" onChange={handleNewFile} ref={imageInputRef} multiple  accept='image/*'disabled={files.length >= 5}/>
        </div>
        <button type='submit'>submit ticket</button>
    </form>
  )
}

export default TicketForm