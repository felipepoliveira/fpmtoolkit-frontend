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