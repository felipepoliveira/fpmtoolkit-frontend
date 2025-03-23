import { NotificationInstance } from "antd/es/notification/interface";
import { UserModel } from "../types/backend-api/user";
import { MessageInstance } from "antd/es/message/interface";

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
    login: (credentials: EmailAndPasswordCredentials) => Promise<UserSession>,

    /**
     * Message instance. Used to show message to the user
     */
    message: MessageInstance,
    

    /**
     * Notification instance. Used to show notifications to the user
     */
    notification: NotificationInstance
}

export interface AuthenticatedAppContextType {
    /**
     * @returns Return data about the authenticated user session
     */
    authenticatedUser: () => UserSession,
    
    /**
     * Make the authenticated user logout. This function only will remove the data about
     * the authenticated user from the application. This function will not route after removing
     * the data of the user
     * @returns 
     */
    logout: () => Promise<void>,
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

export interface UserSession {
    userData: UserModel,
    sessionExpiresAt: string,
}