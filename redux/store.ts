import {configureStore} from "@reduxjs/toolkit";
import  organizationSlice  from "@/slices/organizationSlice";
import ticketSlice from "@/slices/ticketSlice";


export const store = configureStore({
    reducer:{
        organization : organizationSlice,
        ticket : ticketSlice
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store