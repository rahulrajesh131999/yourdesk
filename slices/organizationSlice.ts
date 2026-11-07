import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";


export interface OrganizationState {
    organizationDetails : string | null,
    editOrganization : boolean
}

const initialState:OrganizationState = {
    editOrganization : false,
    organizationDetails : null
} satisfies OrganizationState as OrganizationState

export const organizationSlice = createSlice({
    name : "organization",
    initialState,
    reducers : {
        setEditOrganization:(state, action:PayloadAction<boolean>)=>{
            state.editOrganization = action.payload
        },
        setOrganizationDetails : (state, action:PayloadAction<string|null>)=>{
            state.organizationDetails = action.payload
        }
    }
})

export const {setEditOrganization, setOrganizationDetails} = organizationSlice.actions
export default organizationSlice.reducer