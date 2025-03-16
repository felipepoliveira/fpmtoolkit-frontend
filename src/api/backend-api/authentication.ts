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
 * Request payload for [POST]/public/tokens/email-and-password service
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
 * Response payload for [POST]/public/tokens/email-and-password service
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

/// Services
const AuthenticationService = {
    /**
     * Generated a authentication token that can used as a session for the client
     * @param payload Payload used in the request
     * @returns {Promise<GenerateAuthenticationTokenWithEmailAndPasswordResponse>}
     */
    generateAuthenticationTokenWithEmailAndPassword: async (payload: GenerateAuthenticationTokenWithEmailAndPasswordRequest): Promise<GenerateAuthenticationTokenWithEmailAndPasswordResponse> => {
        return (await BackendApi.post("/api/auth/public/tokens/email-and-password", payload)).data
    }
}

export default AuthenticationService