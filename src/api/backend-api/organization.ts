import { OrganizationModel } from "../../types/backend-api/organization"
import BackendApi from "./backend-api"

interface CreateOrganizationRequest {
    /**
     * The presentation name of the created organization
     */
    presentationName: string,
    /**
     * The profile name of the created organization
     */
    profileName: string
}

const OrganizationService = {
    /**
     * Create a new organization into the platform owned by the authenticated user
     * @param payload 
     * @returns 
     */
    createOrganization: async (payload: CreateOrganizationRequest): Promise<OrganizationModel> => {
        return (await BackendApi.post("/api/organizations", payload)).data
    }
}

export default OrganizationService