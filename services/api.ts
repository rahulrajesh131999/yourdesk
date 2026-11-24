const BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export const organizationEndpoints = {
    GET_ORGANIZATION_API : BASE_URL + "/organization",
    CREATE_ORGANIZATION_API : BASE_URL + "/organization",
    UPDATE_ORGANIZATION_API : (id:string) => `${BASE_URL}/organization/${id}`,
    DELETE_ORGANIZATION_API : (id:string) => `${BASE_URL}/organization/${id}`,
    GET_ORGANIZATION_BY_ID_API: (id:string) => `${BASE_URL}/organization/${id}`
    
}


/* ------------------------ Ticket Endpoints ---------------------------------- */

export const ticketEndpoints = {
    GET_TICKET_API : BASE_URL + "/ticket",
    CREATE_NEW_TICKET : BASE_URL + "/ticket",
    GET_TICKET_DETAILS :(id:string) => BASE_URL + `/ticket/${id}`,
    EDIT_TICKET :(id:string) => BASE_URL +  `/ticket/${id}`,
    DELETE_TICKET :(id:string) => BASE_URL +  `/ticket/${id}`
}