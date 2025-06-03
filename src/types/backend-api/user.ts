/**
 * User model
 */
export interface UserModel {
    /**
     * The user selected preferred region
     */
    preferredRegion: string,
    /**
     * User's primary email
     */
    primaryEmail: string,
    /**
     * When the primary email was confirmed
     */
    primaryEmailConfirmedAt: string,
    /**
     * User presentation name
     */
    presentationName: string,
    /**
     * User UUID
     */
    uuid: string,
}

/**
 * Store all roles related to STL roles
 */
export type StlRole = "ROLE_STL_MOST_SECURE" | "ROLE_STL_SAME_SESSION" | "ROLE_STL_SECURE"

/**
 * Store all roles related to user member role
 */
export type UserMemberRole = "ROLE_ORG_ADMINISTRATOR" | "ROLE_ORG_MEMBER_ADMINISTRATOR"

/**
 * Store all roles that can be stored in the user session
 */
export type UserSessionRole = StlRole | UserMemberRole

/**
 * Represents the user session
 */
export interface UserSession {
    /**
     * The user identification
     */
    userIdentifier: string,
    /**
     * Session client identifier
     */
    currentClientIdentifier: string,
    /**
     * The original identifier used by the client while creating the session credentials
     */
    originalClientIdentifier: string,
    /**
     * The user session roles
     */
    roles: UserSessionRole[],
    /**
     * Date when the session was created
     */
    sessionStartedAt: string,
    /**
     * Date when the session will end
     */
    sessionExpiresAt: string,
}