import { useParams } from "react-router";
import { OrganizationModel } from "../../../types/backend-api/organization";
import OrganizationService from "../../../api/backend-api/organization";
import SelectedOrganizationStore from "../../../store/selected-organization";
import AuthenticationService from "../../../api/backend-api/authentication";
import UserSessionStore from "../../../store/user-session";
import SessionCredentialsStore from "../../../store/session-credentials";
import { OrganizationMemberModel } from "../../../types/backend-api/organization-member";
import { OrganizationMemberService } from "../../../api/backend-api/organization-member";

export interface SelectedOrganization {
    organization: OrganizationModel,
    authenticatedUserMembership: OrganizationMemberModel
}


interface SelectedOrganizationProvider {
    profileName?: string,
    selectedOrganizationProvider: () => Promise<SelectedOrganization>,
    clearSelectedOrganizationCache: () => void,
}

function clearSelectedOrganizationCache() {
    SelectedOrganizationStore.clear()
    window.location.reload();
}


export function useSelectedOrganizationProvider(): SelectedOrganizationProvider {
    const { profileName } = useParams();

    if (!profileName) {
        return { selectedOrganizationProvider: () => Promise.reject(new Error("No profile name provided")), profileName, clearSelectedOrganizationCache }
    }

    // check if the organization is already stored in the local storage and its the same profile name as in the path variable in URL
    const organizationFromStore = SelectedOrganizationStore.get()
    if (organizationFromStore && organizationFromStore.organization.profileName === profileName) {
        return { selectedOrganizationProvider: () => Promise.resolve(organizationFromStore), profileName, clearSelectedOrganizationCache }
    }

    // the callback will fetch the data from the API and updated it in the store
    const providerCallback = async (): Promise<SelectedOrganization> => {
        try {

            // fetch organization data from the API and
            // // refresh session data with the roles of the organization
            const organizationFromApi = await OrganizationService.findByProfileName(profileName)
            const refreshTokenPayload = await AuthenticationService.refreshToken({ organizationId: organizationFromApi.uuid })
            SessionCredentialsStore.store(refreshTokenPayload.token)

            // update user data and session into the store
            const userData = await AuthenticationService.fetchUserDataWithBearerToken(refreshTokenPayload.token)
            const userSessionFromApi = await AuthenticationService.fetchSessionDataWithBearerToken(refreshTokenPayload.token)
            const userMembershipOnOrganization = await OrganizationMemberService.me(organizationFromApi.uuid)
            const userSession = {
                userData: userData,
                session: userSessionFromApi
            }

            // store the session data in local storage
            UserSessionStore.store(userSession)

            // Put the membership of the authenticated user and its organization on the store
            const dataToStoreAndReturn = {
                organization: organizationFromApi,
                authenticatedUserMembership: userMembershipOnOrganization
            }
            SelectedOrganizationStore.store(dataToStoreAndReturn)

            // return the current organization
            return Promise.resolve(dataToStoreAndReturn)
        } catch (error) {
            return Promise.reject(error)
        }
    }


    return { selectedOrganizationProvider: providerCallback, profileName, clearSelectedOrganizationCache }
}