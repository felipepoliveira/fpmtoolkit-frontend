import { UserModel, UserSession } from "../../types/backend-api/user";
import BackendApi from "./backend-api";

/// Types
/**
 * Type for the payload returned from the authentication process
 */
interface ApiAuthenticationTokenPayload {
    /**
     * Identifier used to identify the client device
     */
    clientIdentifier: string,
    /**
     * When the session will expire
     */
    expiresAt: string,
    /**
     * When the session was issued
     */
    issuedAt: string,
    /**
     * The roles associated with the session
     */
    roles: string,
    /**
     * User identifier in the session
     */
    userIdentifier: string
}

/**
 * Request payload for [POST]/api/auth/public/tokens/email-and-password service
 */
interface GenerateAuthenticationTokenWithEmailAndPasswordRequest {
    /**
     * The primary email provided for the authentication
     */
    primaryEmail: string,
    /**
     * The password provided for the authentication
     */
    password: string,
}

/**
 * Response payload for [POST]/api/auth/public/tokens/email-and-password service
 */
interface GenerateAuthenticationTokenWithEmailAndPasswordResponse {
    /**
     * The token returned from the API response
     */
    token: string,
    /**
     * Payload containing data about the opened session
     */
    payload: ApiAuthenticationTokenPayload,
}

/**
 * Response payload for [GET]/api/auth/public/access-emails/{email}/is-available
 */
interface IsEmailAvailableToUseResponse {
    /**
     * Flag that indicates if the email is available to use
     */
    isAvailable: boolean,
}

/// Services
const AuthenticationService = {
    /**
     * Return session data of the provided token
     * @param token 
     * @returns 
     */
    fetchSessionDataWithBearerToken: async(token: string): Promise<UserSession> => {
        return (await BackendApi.get("/api/auth/session", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })).data
    },
    fetchUserDataWithBearerToken: async (token: string): Promise<UserModel> => {
        return (await BackendApi.get("/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
    })).data
    },

    /**
     * Generated a authentication token that can used as a session for the client
     * @param payload Payload used in the request
     * @returns {Promise<GenerateAuthenticationTokenWithEmailAndPasswordResponse>}
     */
    generateAuthenticationTokenWithEmailAndPassword: async (payload: GenerateAuthenticationTokenWithEmailAndPasswordRequest): Promise<GenerateAuthenticationTokenWithEmailAndPasswordResponse> => {
        return (await BackendApi.post("/api/auth/public/tokens/email-and-password", payload)).data
    },

    /**
     * Checks if the email is available to use
     * @param email Email to check
     * @returns {Promise<IsEmailAvailableToUseResponse>}
     */
    isEmailAvailableToUse: async (email: string): Promise<IsEmailAvailableToUseResponse> => {
        return (await BackendApi.get(`/api/auth/public/access-emails/${email}/is-available`)).data
    }
}

export default AuthenticationService