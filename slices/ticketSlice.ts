import { createSlice, PayloadAction } from "@reduxjs/toolkit"


export interface TicketState {
    ticketEdit : boolean,
    ticketDetails : string | null,
    ticketImages : string | null
}

const initialState:TicketState = {
    ticketEdit : false,
    ticketDetails : null,
    ticketImages : null
}

export const ticketSlice = createSlice({
    name : "ticket",
    initialState,
    reducers : {
        setEditTicket:(state, action:PayloadAction<boolean>)=>{
            state.ticketEdit = action.payload
        },
        setTicketDetails : (state, action:PayloadAction<string|null>)=>{
            state.ticketDetails = action.payload
        },
        setTicketImages : (state, action:PayloadAction<string|null>)=>{
            state.ticketImages = action.payload
        }
    }
})

export const {setEditTicket, setTicketDetails } = ticketSlice.actions
export default ticketSlice.reducer