const BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export const organizationEndpoints = {
    GET_ORGANIZATION_API : BASE_URL + "/organization",
    CREATE_ORGANIZATION_API : BASE_URL + "/organization",
    UPDATE_ORGANIZATION_API : (id:string) => `${BASE_URL}/organization/${id}`,
    DELETE_ORGANIZATION_API : (id:string) => `${BASE_URL}/organization/${id}`,
    
}