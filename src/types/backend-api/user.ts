import { OrganizationMemberRole } from "./organization-member"

/**
 * Type used in roles stored in session returned by the back-end
 */
interface GrantedAuthority {
    authority: string
}

export interface PrimaryEmailChangeTokenPayload {
  /**
   * The user unique identification
   */
  userIdentifier: string;

  /**
   * The new primary e-mail
   */
  newPrimaryEmail: string;

  /**
   * When the token was issued
   */
  issuedAt: string; // ISO 8601 datetime format

  /**
   * When the token will expire
   */
  expiresAt: string; // ISO 8601 datetime format
}

export interface PrimaryEmailChangeTokenAndPayload {
  /**
   * The issued token
   */
  token: string;

  /**
   * The content of the token
   */
  payload: PrimaryEmailChangeTokenPayload;
}

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
    primaryEmailConfirmedAt?: string,
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

export type OrganizationMemberSessionRole = "ROLE_ORG_ADMINISTRATOR" | "ROLE_ORG_MEMBER_ADMINISTRATOR"


/**
 * Store all roles that can be stored in the user session
 */
export type UserSessionRole = StlRole | OrganizationMemberSessionRole

/**
 * 
 */
type RoleMap = {
    [K in UserSessionRole]: GrantedAuthority;
}

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
    roles: RoleMap,
    /**
     * Date when the session was created
     */
    sessionStartedAt: string,
    /**
     * Date when the session will end
     */
    sessionExpiresAt: string,
}
