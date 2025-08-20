import { PaginationMetadata } from "../../types/backend-api/pagination";
import { ProjectModel } from "../../types/backend-api/project";
import BackendApi from "./backend-api";

export const ProjectService = {
    /**
     * Fetch all projects of the given organization using pagination
     * @param organizationUuid 
     * @param currentPage 
     * @param limit 
     * @returns 
     */
    fetchAllFromOrganization: async (organizationUuid: string, currentPage: number, limit: number = 20): Promise<ProjectModel[]> => {
        return (await BackendApi.get(`/api/organizations/${organizationUuid}/projects?page=${currentPage}&limit=${limit}`)).data
    },

    /**
     * Fetch all projects of the given organization using pagination
     * @param organizationUuid 
     * @param currentPage 
     * @param limit 
     * @returns 
     */
    paginationOfAllFromOrganization: async (organizationUuid: string, limit: number = 20): Promise<PaginationMetadata> => {
        return (await BackendApi.get(`/api/organizations/${organizationUuid}/projects?pagination=true&limit=${limit}`)).data
    },

    /**
     * Fetch a project identified its profile name
     * @param organizationUuid 
     * @param profileName 
     * @returns 
     */
    fetchByProfileName: async (organizationUuid: string, profileName: string): Promise<ProjectModel> => {
        return (await BackendApi.get(`/api/organizations/${organizationUuid}/projects/find-by-profile-name/${profileName}`)).data
    }
}