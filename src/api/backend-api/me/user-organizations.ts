import { OrganizationModel } from "../../../types/backend-api/organization"
import BackendApi from "../backend-api"

const UserOrganizationsService = {
    /**
     * Fetch all the organization owned by the authenticated user or the ones that
     * it is a member of
     * @param page 
     * @param limit 
     */
    fetchOrganizationFromRequesterClient: async (page: number, limit: number = 20): Promise<OrganizationModel[]> => {
        return (await BackendApi.get(`/api/me/organizations?page=${page}&limit=${limit}`)).data
    }
}

export default UserOrganizationsService