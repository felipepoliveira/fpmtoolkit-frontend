import { OrganizationMemberModel } from "../../types/backend-api/organization-member";
import { PaginationMetadata } from "../../types/backend-api/pagination";
import BackendApi from "./backend-api";

export const OrganizationMemberService = {
    /**
     * Return all organization members of the given organization using pagination
     * @param organizationUuid 
     * @param page 
     * @param limit 
     * @returns 
     */
    findByOrganization: async (organizationUuid: string, page: number, limit: number = 10): Promise<OrganizationMemberModel[]> => {
        const queryParameters = `pagination=false&page=${page}&limit=${limit}`
        return  (await (BackendApi.get(`/api/organizations/${organizationUuid}/members?${queryParameters}`))).data
    },

    /**
     * Return pagination metadata of all organization members of the given organization
     * @param organizationUuid 
     * @param page 
     * @param limit 
     * @returns 
     */
    paginationByOrganization: async (organizationUuid: string, page: number, limit: number = 10): Promise<PaginationMetadata> => {
        const queryParameters = `pagination=true&page=${page}&limit=${limit}`
        return  (await (BackendApi.get(`/api/organizations/${organizationUuid}/members?${queryParameters}`))).data
    },
}