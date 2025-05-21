import { OrganizationMemberModel } from "../../types/backend-api/organization-member";
import { PaginationMetadata } from "../../types/backend-api/pagination";
import BackendApi from "./backend-api";

/**
 * Payload used in [POST] /api/organizations-members/public/ingress-by-invite
 */
interface IngressByInviteRequest {
    token: string
}

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
     * Ingress into a organization creating a new OrganizationMemberModel. The organization member created is returned by
     * this endpoint
     * @param payload 
     * @returns 
     */
    ingressByInvite: async (payload: IngressByInviteRequest): Promise<OrganizationMemberModel> => {
        return (await (BackendApi.post(`/api/organization-members/public/ingress-by-invite`, payload))).data
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