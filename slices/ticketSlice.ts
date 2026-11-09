import { createSlice, PayloadAction } from "@reduxjs/toolkit"


export interface TicketState {
    ticketEdit : boolean,
    ticketDetails : string | null
}

const initialState:TicketState = {
    ticketEdit : false,
    ticketDetails : null
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
        }
    }
})

export const {setEditTicket, setTicketDetails } = ticketSlice.actions
export default ticketSlice.reducer