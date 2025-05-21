import { I18nRegion } from "../../types/backend-api/i18n-region"
import { OrganizationMemberInviteModel } from "../../types/backend-api/organization-member-invite"
import { PaginationMetadata } from "../../types/backend-api/pagination"
import BackendApi from "./backend-api"

interface CreateInviteRequest {
    /**
     * The email of the user to be invited to the organization
     */
    memberEmail: string,
    /**
     * The language used in the invite mail
     */
    inviteMailLanguage: I18nRegion,
}

interface ResendMailRequest {
    /**
     * The language used in the invite mail
     */
    mailLanguage: I18nRegion
}

export const OrganizationMemberInviteService = {

    /**
     * Create a new organization member invite
     * @param organizationUuid 
     * @param page 
     * @param limit 
     * @returns 
     */
    createNewInvite: async (organizationUuid: string, dto: CreateInviteRequest): Promise<OrganizationMemberInviteModel> => {
        return (await BackendApi.post(`/api/organizations/${organizationUuid}/invites`, dto)).data
    },
    /**
     * Return organization member invite data from the back-end API using the invite token as credentials
     * @param inviteToken 
     * @returns 
     */
    findByInviteToken: async (inviteToken: string): Promise<OrganizationMemberInviteModel> => {
        return (await BackendApi.get(`/api/organization-member-invites/public/by-token/${inviteToken}`)).data
    },
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
    paginationByOrganization: async (organizationUuid: string, page: number, limit: number = 20): Promise<PaginationMetadata> => {
        const queryParameters = `pagination=true&limit=${limit}&page=${page}`
        return (await BackendApi.get(`/api/organizations/${organizationUuid}/invites?${queryParameters}`)).data
    },
    /**
     * Delete a invite identified by the inviteUuid parameter
     * @param organizationUuid 
     * @param inviteUuid 
     * @returns 
     */
    remove: async(organizationUuid: string, inviteUuid: string): Promise<void> => {
        return await BackendApi.delete(`/api/organizations/${organizationUuid}/invites/${inviteUuid}`)
    },

    /**
     * Resend the invite mail to the owner of the invite
     * @param organizationUuid 
     * @param inviteUuid 
     * @returns 
     */
    resendMail: async(organizationUuid: string, inviteUuid: string, payload: ResendMailRequest): Promise<void> => {
        return await BackendApi.post(`/api/organizations/${organizationUuid}/invites/${inviteUuid}/resend-mail`, payload)
    }
}