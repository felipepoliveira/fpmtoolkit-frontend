// Types

import { I18nRegion } from "../../types/backend-api/i18n-region"
import BackendApi from "./backend-api"

/**
 * Request for [POST]/users endpoint
 */
interface CreateUserRequest {
    /**
     * The created user password
     */
    password: string,
    /**
     * The preferred region associated with the user account
     */
    preferredRegion: I18nRegion,

    /**
     * The presentation name of the user
     */
    presentationName: string,

    /**
     * The primary email of the user
     */
    primaryEmail: string,
}

interface CreateUserResponse {
    /**
     * The preferred region of the user
     */
    preferredRegion: I18nRegion,
    /**
     * The primary email of the user
     */
    primaryEmail: string,
    /**
     * ISO 8601 string representing the date when the user was created
     */
    primaryEmailConfirmedAt: string,
    /**
     * The presentation name of the user
     */
    presentationName: string,
    /**
     * The UUID of the user
     */
    uuid: string,
}

const UserService = {
    /**
     * Creates a new user account
     * @param payload 
     * @returns 
     */
    createUser: async (payload: CreateUserRequest): Promise<CreateUserResponse> => {
        return (await BackendApi.post("/api/users/public", payload)).data
    }
}

export default UserService