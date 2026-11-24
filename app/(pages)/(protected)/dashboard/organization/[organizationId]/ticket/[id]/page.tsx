"use client";
import { ticketEndpoints } from "@/services/api";
import { useParams } from "next/navigation";
import React, { useEffect, use, useState } from "react";
import {setEditTicket,setTicketDetails, setTicketImages} from "@/slices/ticketSlice"
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import TicketForm from "@/components/forms/TicketForm";

const page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  const routeParams = useParams<{ organizationId: string; id: string }>();
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [ticket, setTicket] = useState<any>()
  const [pageEditTicket, setPageEditTicket] = useState<boolean>(false)

   const {ticketEdit, ticketDetails} = useAppSelector((state:any)=>state.ticket)

  const organizationId = routeParams.organizationId;
  const ticketId = routeParams.id;

  console.log("this is ticket id", ticketId);
  console.log("this is organization id", organizationId);

  useEffect(() => {
    const controller = new AbortController();

    const getTicket = async () => {
      try {
        const response = await fetch(ticketEndpoints.GET_TICKET_DETAILS(id), {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
        },
          credentials: "include",
          body: JSON.stringify({organizationId}),
          signal: controller.signal,
        });

        console.log("printing response", response);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        console.log("printing ticket details", result.data);
        if(result.data){
          console.log("organizationId", result.data?.organizationId)
          setTicket(result.data)
          dispatch(setTicketDetails(result.data))
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("ticket fetch error", error);
      }
    };

    getTicket();

    return () => {
      
      controller.abort();
    };
  }, [organizationId, id]);

  const editModal=()=>{
    if(ticketDetails){
      dispatch(setEditTicket(true))
      setPageEditTicket(true)
    }
  }

  return (
  <div className="flex flex-col">
    <h1>ticket id: {ticket?.id}</h1>
    <h3>organization id : {ticket?.organizationId}</h3>
    <h1>ticket name : {ticket?.name}</h1>
    <button onClick={editModal}>edit ticket</button>

    {
      pageEditTicket &&  (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
          <TicketForm organizationID={ticket?.organizationId}/>
        </div>
      )
    }
    </div>  
  )
};

export default page;
