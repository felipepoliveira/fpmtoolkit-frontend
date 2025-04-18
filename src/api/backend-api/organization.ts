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
    },

    /**
     * Find a organization by its profile name. If the requester is not a member of the organization, the request will be rejected
     * @param organizationUuid 
     * @returns 
     */
    findByProfileName: async (profileName: string): Promise<OrganizationModel> => {
        return (await BackendApi.get(`/api/organizations/find-by-profile-name/${profileName}`)).data
    },

    /**
     * Find a organization by its UUID. If the requester is not a member of the organization, the request will be rejected
     * @param organizationUuid 
     * @returns 
     */
    findByUuid: async (organizationUuid: string): Promise<OrganizationModel> => {
        return (await BackendApi.get(`/api/organizations/${organizationUuid}`)).data
    },
}

export default OrganizationService