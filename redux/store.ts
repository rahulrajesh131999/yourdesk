import {configureStore} from "@reduxjs/toolkit";
import  organizationSlice  from "@/slices/organizationSlice";


export const store = configureStore({
    reducer:{
        organization : organizationSlice
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store