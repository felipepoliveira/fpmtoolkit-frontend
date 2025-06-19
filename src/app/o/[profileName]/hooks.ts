import { useParams } from "react-router";
import { OrganizationModel } from "../../../types/backend-api/organization";
import OrganizationService from "../../../api/backend-api/organization";
import SelectedOrganizationStore from "../../../store/selected-organization";
import AuthenticationService from "../../../api/backend-api/authentication";
import UserSessionStore from "../../../store/user-session";
import SessionCredentialsStore from "../../../store/session-credentials";

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
    const providerCallback = async (): Promise<OrganizationModel> => {
        try {

            // fetch organization data from the API
            const organizationFromApi = await OrganizationService.findByProfileName(profileName)
            
            // refresh session data with the roles of the organization
            const refreshTokenPayload = await AuthenticationService.refreshToken({ organizationId: organizationFromApi.uuid })
            const userData = await AuthenticationService.fetchUserDataWithBearerToken(refreshTokenPayload.token)
            const userSessionFromApi = await AuthenticationService.fetchSessionDataWithBearerToken(refreshTokenPayload.token)
            const userSession = {
                userData: userData,
                session: userSessionFromApi
            }

            // store the session data in local storage
            UserSessionStore.store(userSession)
            SessionCredentialsStore.store(refreshTokenPayload.token)
            SelectedOrganizationStore.store(organizationFromApi)

            // return the current organization
            return Promise.resolve(organizationFromApi)
        } catch (error) {
            return Promise.reject(error)
        }
    }


    return { selectedOrganizationProvider: providerCallback, profileName }
}