import { PrimaryEmailChangeTokenAndPayload, UserModel, UserSession } from "../../types/backend-api/user";
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
 * Request payload for [POST] /api/auth/confirm-primary-email-with-token
 */
interface ConfirmPrimaryEmailWithTokenRequest {
    /**
     * The confirmation token value
     */
    confirmationToken: string,
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

interface GenerateAuthenticationTokenWithPasswordRequest {
    /**
     * The password used to authenticate the user
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

interface RefreshTokenRequest {
    /**
     * The organization ID used to refresh the token. This parameter should
     * be used when the roles of the session should be applied based on a
     * organization
     */
    organizationId?: string
}

/**
 * Payload for [POST]/api/auth/send-primary-email-change-mail
 */
interface SendPrimaryEmailChangeMailRequest {
    /**
     * The new primary email
     */
    newPrimaryEmail: string,
}

interface UpdatePrimaryEmailWithToken {
    /**
     * The confirmation code that could be found in the new email
     */
    confirmationCode: string,
    /**
     * The token that will authenticate the operation
     */
    token: string,
    
}

/// Services
const AuthenticationService = {

    /**
     * Confirm the primary email ownership using a confirmation token provided by the back-end API
     * @param payload 
     * @returns 
     */
    confirmPrimaryEmailWithToken: async(payload: ConfirmPrimaryEmailWithTokenRequest): Promise<void> => {
        return await BackendApi.put("/api/auth/confirm-primary-email-with-token", payload)
    },

     /**
     * Return session data of the authenticated user
     * @param token 
     * @returns 
     */
    fetchSessionData: async(): Promise<UserSession> => {
        return (await BackendApi.get("/api/auth/session")).data
    },
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
     * Generate a new authentication token for the authenticated client using its given password as authentication method
     * @param payload 
     * @returns 
     */
    generateAuthenticationTokenWithPassword: async (payload: GenerateAuthenticationTokenWithPasswordRequest): Promise<GenerateAuthenticationTokenWithEmailAndPasswordResponse> => {
        return (await BackendApi.post("/api/auth/tokens/password", payload)).data
    },

    /**
     * Checks if the email is available to use
     * @param email Email to check
     * @returns {Promise<IsEmailAvailableToUseResponse>}
     */
    isEmailAvailableToUse: async (email: string): Promise<IsEmailAvailableToUseResponse> => {
        return (await BackendApi.get(`/api/auth/public/access-emails/${email}/is-available`)).data
    },

    /**
     * Generate a refresh token that always update the data of the user session. This function is helpful
     * when its needed to refresh the user token roles, for example
     * @returns 
     */
    refreshToken: async(payload: RefreshTokenRequest): Promise<GenerateAuthenticationTokenWithEmailAndPasswordResponse> => {
        return (await BackendApi.post(`/api/auth/tokens/refresh`, payload)).data
    },

    /**
     * Send the primary email confirmation mail to the authenticated user registered primary email
     * @returns 
     */
    sendPrimaryEmailConfirmationMail: async(): Promise<void> => {
        return await BackendApi.post(`/api/auth/send-primary-email-confirmation-mail`)
    },

    /**
     * Send the primary email change mail. Also, this service returns a token that should be used
     * to the primary email change operation completion
     * @param payload 
     * @returns 
     */
    sendPrimaryEmailChangeMail: async(payload: SendPrimaryEmailChangeMailRequest): Promise<PrimaryEmailChangeTokenAndPayload> => {
        return (await BackendApi.post(`/api/auth/send-primary-email-change-mail`, payload)).data
    },

    /**
     * Update the authenticated user primary email using the token technique
     * @param payload 
     * @returns 
     */
    updatePrimaryEmailWithToken: async(payload: UpdatePrimaryEmailWithToken): Promise<UserModel> => {
        return (await BackendApi.put(`/api/auth/update-primary-email-with-token`, payload)).data
    },
}

export default AuthenticationService