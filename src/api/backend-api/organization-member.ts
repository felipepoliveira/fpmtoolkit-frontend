import { OrganizationMemberModel, OrganizationMemberRole } from "../../types/backend-api/organization-member";
import { PaginationMetadata } from "../../types/backend-api/pagination";
import BackendApi from "./backend-api";

/**
 * Payload used in [POST] /api/organizations-members/public/ingress-by-invite
 */
interface IngressByInviteRequest {
    token: string
}

/**
 * Payload used in [PUT] /api/organizations/:organizationUuid/members/:targetMemberUuid
 */
interface UpdateOrganizationMemberRequest {
    /**
     * The roles of the organization member
     */
    roles: OrganizationMemberRole[]
}

export const OrganizationMemberService = {

    /**
     * Change the organization owner to the organization member identified by 'targetMemberUuid' parameter
     * @param organizationUuid  - The UUID of the organization
     * @param targetMemberUuid  - The UUID of the organization member that will be the owner of the organization
     * @returns 
     */
    changeOrganizationOwner: async (organizationUuid: string, targetMemberUuid: string): Promise<OrganizationMemberModel> => {
        return  (await (BackendApi.put(`/api/organizations/${organizationUuid}/members/${targetMemberUuid}/set-to-owner`))).data
    },

    /**
     * Return all organization members of the given organization using pagination
     * @param organizationUuid 
     * @param page 
     * @param limit 
     * @returns 
     */
    findByOrganization: async (organizationUuid: string, page: number, limit: number = 10, queryField: String = ""): Promise<OrganizationMemberModel[]> => {
        const queryParameters = `pagination=false&page=${page}&limit=${limit}&queryField=${queryField}`
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
    paginationByOrganization: async (organizationUuid: string, page: number, limit: number = 10, queryField: String = ""): Promise<PaginationMetadata> => {
        const queryParameters = `pagination=true&page=${page}&limit=${limit}&queryField=${queryField}`
        return  (await (BackendApi.get(`/api/organizations/${organizationUuid}/members?${queryParameters}`))).data
    },

    /**
     * Return the organization membership of the authenticated user from the given organization identified by 'organizationUuid'
     * @param organizationUuid 
     * @returns 
     */
    me: async (organizationUuid: string): Promise<OrganizationMemberModel> => {
        return  (await (BackendApi.get(`/api/organizations/${organizationUuid}/members/me`))).data
    },

    removeFromOrganization: async (organizationUuid: string, targetMemberUuid: string): Promise<OrganizationMemberModel> => {
        return  (await (BackendApi.delete(`/api/organizations/${organizationUuid}/members/${targetMemberUuid}`))).data
    },

    /**
     * Update the organization member in the database
     * @param organizationUuid 
     * @param targetMemberUuid 
     * @param payload 
     * @returns 
     */
    update: async (organizationUuid: string, targetMemberUuid: string, payload: UpdateOrganizationMemberRequest): Promise<OrganizationMemberModel> => {
        return  (await (BackendApi.put(`/api/organizations/${organizationUuid}/members/${targetMemberUuid}`, payload))).data
    }
}