import { MessageInstance } from "antd/es/message/interface";
import { NotificationInstance } from "antd/es/notification/interface";
import { OrganizationModel } from "../types/backend-api/organization";
import { UserModel, UserSessionRole, UserSession, StlRole } from "../types/backend-api/user";

export interface AppContextType {
    /**
     * 
     * @returns Return a flag indicating if the user is authenticated
     */
    isAuthenticated: () => Boolean,
    /**
     * Activate the authentication process using email and password credentials. This method only will
     * set the user that is authenticated in the application without redirecting to any kind of page. If
     * redirection is needed the caller of this function should implement it
     * @param credentials 
     * @returns 
     */
    login: (credentials: EmailAndPasswordCredentials) => Promise<UserStoredSession>,

    /**
     * Make the user logout and go back to the unauthenticated login home page
     * @returns 
     */
    logout: () => Promise<void>,

    /**
     * Message instance. Used to show message to the user
     */
    message: MessageInstance,
    

    /**
     * Notification instance. Used to show notifications to the user
     */
    notification: NotificationInstance
}

export type HasRequiredStlEvent = (event: { hasRequiredStl: boolean }) => void

export interface AuthenticatedAppContextType {
    /**
     * @returns Return data about the authenticated user session
     */
    authenticatedUser: () => UserStoredSession,

    /**
     * 
     * @param stlRole 
     * @returns 
     */
    checkMinimumStl: (stlRole: StlRole, callback: HasRequiredStlEvent) => void,

    /**
     * Return a flag indicating if the authenticated user has one of the given roles
     * @param roles 
     * @returns 
     */
    hasRole: (roles: UserSessionRole[]) => boolean,
    
    /**
     * Make the authenticated user logout. This function only will remove the data about
     * the authenticated user from the application. This function will not route after removing
     * the data of the user
     * @returns 
     */
    logout: () => Promise<void>,

    /**
     * Refresh the session data of the authenticated user
     * @returns 
     */
    refreshAuthenticatedUserSession: () => Promise<void>,

    /**
     * The organizations where the user is a member
     */
    organizations: OrganizationModel[],
}



/**
 * Type for the login with email and password
 */
export interface EmailAndPasswordCredentials {
    /**
     * User email
     */
    email: string,
    /**
     * User password
     */
    password: string
}

export interface UserStoredSession {
    userData: UserModel,
    session: UserSession,
}