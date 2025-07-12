import { I18nRegion } from "../../../types/backend-api/i18n-region"
import { UserModel } from "../../../types/backend-api/user"
import BackendApi from "../backend-api"

/**
 * Request payload for [PUT]/api/me/password
 */
interface UpdatePasswordRequest {
    /**
     * The current password
     */
    currentPassword: string,
    /**
     * The new password
     */
    newPassword: string,
}

/**
 * Request payload for [PUT]/api/me
 */
interface UpdateUserDataRequest {
    /**
     * The user presentation name
     */
    presentationName: string,

    /**
     * The authenticated user preferred region
     */
    preferredRegion: I18nRegion,
}

export const AuthenticatedUserService = {
    /**
     * Update the authenticated user password
     * @param payload 
     * @returns 
     */
    updatePassword: async(payload: UpdatePasswordRequest): Promise<UserModel>  => {
        return (await BackendApi.put("/api/me/password", payload)).data
    },

    /**
     * Update the authenticated user data
     * @param payload 
     * @returns 
     */
    updateUserData: async(payload: UpdateUserDataRequest): Promise<UserModel> => {
        return (await BackendApi.put("/api/me", payload)).data
    },
}