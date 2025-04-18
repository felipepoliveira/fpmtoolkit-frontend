import { useParams } from "react-router";
import { OrganizationModel } from "../../../../types/backend-api/organization";
import OrganizationService from "../../../../api/backend-api/organization";
import SelectedOrganizationStore from "../../../../store/selected-organization";

interface SelectedOrganizationProvider {
    profileName?: string,
    selectedOrganizationProvider: () => Promise<OrganizationModel>
}

export function useSelectedOrganizationProvider(): SelectedOrganizationProvider {
    const { profileName } = useParams();

    if (!profileName) {
        return { selectedOrganizationProvider: () => Promise.reject(new Error("No profile name provided")), profileName }
    }

    // check if the organization is already stored in the local storage and its the same profile name as in the path variable in URL
    const organizationFromStore = SelectedOrganizationStore.get()
    if (organizationFromStore && organizationFromStore.profileName === profileName) {
        return { selectedOrganizationProvider: () => Promise.resolve(organizationFromStore), profileName }
    }

    // the callback will fetch the data from the API and updated it in the store
    const providerCallback =  async () : Promise<OrganizationModel> => {
        try {
            const organizationFromApi = await OrganizationService.findByProfileName(profileName)
            SelectedOrganizationStore.store(organizationFromApi)
            return Promise.resolve(organizationFromApi)
        } catch (error) {
            return Promise.reject(error)
        }
    }


    return { selectedOrganizationProvider: providerCallback , profileName }
}