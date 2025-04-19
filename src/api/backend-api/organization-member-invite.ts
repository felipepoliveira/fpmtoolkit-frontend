import { OrganizationMemberInviteModel } from "../../types/backend-api/organization-member-invite"
import { Pagination } from "../../types/backend-api/pagination"
import BackendApi from "./backend-api"

export const OrganizationMemberInviteService = {
    /**
     * Fetch pagination metadata of all organization member invites of the given organization
     * @param organizationUuid 
     * @param page 
     * @param limit 
     * @returns 
     */
    findByOrganization: async (organizationUuid: string, page: number, limit: number = 20): Promise<OrganizationMemberInviteModel[]> => {
        const queryParameters = `pagination=false&limit=${limit}&page=${page}`
        return (await BackendApi.get(`/api/organizations/${organizationUuid}/invites?${queryParameters}`)).data
    },

    /**
     * Fetch pagination metadata of all organization member invites of the given organization
     * @param organizationUuid 
     * @param page 
     * @param limit 
     * @returns 
     */
    paginationByOrganization: async (organizationUuid: string, page: number, limit: number = 20): Promise<Pagination> => {
        const queryParameters = `pagination=true&limit=${limit}&page=${page}`
        return (await BackendApi.get(`/api/organizations/${organizationUuid}/invites?${queryParameters}`)).data
    }
}