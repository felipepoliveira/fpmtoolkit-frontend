import { Layout, MenuProps } from "antd";
import { Footer, Header } from "antd/es/layout/layout";
import { createContext, JSX, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import UserOrganizationsService from "../api/backend-api/me/user-organizations";
import SessionCredentialsStore from "../store/session-credentials";
import UserSessionStore from "../store/user-session";
import { OrganizationModel } from "../types/backend-api/organization";
import { AppContext } from "./App";
import { AuthenticatedAppContextType, UserSession } from "./types";


export const AuthenticatedAppContext = createContext<AuthenticatedAppContextType>({} as AuthenticatedAppContextType)


export default function AuthLayout(): JSX.Element {
    const appContext = useContext(AppContext)
    const navigate = useNavigate()
    const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading')
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationModel | undefined>(undefined)
    const [userOrganizations, setUserOrganization] = useState<OrganizationModel[] | undefined>(undefined)
    const [userOrganizationsPage, setUserOrganizationsPage] = useState(1)

    // The authenticated app context instance
    const authenticatedAppContext = useMemo(() => {
        const authenticatedAppContext: AuthenticatedAppContextType = {
            authenticatedUser: (): UserSession => {
                const userSession = UserSessionStore.get()
                if (!userSession) {
                    throw new Error("No user session is stored in the app context")
                }

                return userSession
            },
            logout: (): Promise<void> => {
                UserSessionStore.clear()
                SessionCredentialsStore.clear()

                //
                return Promise.resolve()
            },

            // start empty, but is loaded on a useEffect
            organizations: (userOrganizations === undefined) ? [] : userOrganizations, 
        }
        return authenticatedAppContext
    }, [userOrganizations])

    /**
     * Observe the userOrganizations state so it can fetch the authenticated user organizations
     * from the Back-end api
     */
    useEffect(() => {

        // ignore the fetching process if it is already defined
        if (userOrganizations !== undefined) {
            // if the authenticated user is not a member of any organization redirect it to the organization creation interface
            if (userOrganizations.length === 0) {
                navigate('/organizations/create?hideNavigation=true')
            }

            // include the user organizations in the authenticated app context
            authenticatedAppContext.organizations = userOrganizations

            return
        }

        UserOrganizationsService.fetchOrganizationFromRequesterClient(userOrganizationsPage)
            .then(organizations => {
                setUserOrganization(organizations)
            })
            .catch(e => {
                console.error(e)
            })
    }, [userOrganizations])

    /**
     * Observe state changes
     */
    useEffect(() => {
        setState((state !== 'error' && userOrganizations !== undefined) ? 'ready' : 'loading')
    }, [userOrganizations])

    const handleLogout = () => {
        authenticatedAppContext.logout()
        navigate("/login")
    };

    // if the user is not authenticated redirect it to the login
    if (!appContext.isAuthenticated()) {
        return <Navigate to={"/login"} />
    }

    const items: MenuProps['items'] = [
        { key: '' }
    ]
  

    return (
        <AuthenticatedAppContext.Provider value={authenticatedAppContext}>
            <Layout>
                <Header style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="demo-logo" />
                </Header>
                <div style={{ padding: '0 48px', marginTop: 32 }}>
                    <Outlet />
                </div>
                <Footer style={{ textAlign: 'center' }}>
                    FPM Toolkit
                </Footer>
            </Layout>
        </AuthenticatedAppContext.Provider>
    )
}