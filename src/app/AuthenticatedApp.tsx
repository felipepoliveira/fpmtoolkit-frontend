import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Layout, MenuProps, Typography } from "antd";
import { Header } from "antd/es/layout/layout";
import { createContext, JSX, useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, useNavigate } from "react-router";
import UserOrganizationsService from "../api/backend-api/me/user-organizations";
import SessionCredentialsStore from "../store/session-credentials";
import UserSessionStore from "../store/user-session";
import { OrganizationModel } from "../types/backend-api/organization";
import { StlRole, UserSessionRole } from "../types/backend-api/user";
import StlElevationModal, { StlElevationEvent } from "./@components/StlElevationModal/StlElevationModal";
import { AppContext } from "./App";
import { AuthenticatedAppContextType, HasRequiredStlEvent, UserStoredSession } from "./types";
import AuthenticationService from "../api/backend-api/authentication";


export const AuthenticatedAppContext = createContext<AuthenticatedAppContextType>({} as AuthenticatedAppContextType)


export default function AuthLayout(): JSX.Element {
    const appContext = useContext(AppContext)
    const navigate = useNavigate()
    const [state, setState] = useState<'loading' | 'error' | 'ready'>('loading')
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationModel | undefined>(undefined)
    const [showStlElevationModal, setShowStlElevationModal] = useState(false)
    const [userOrganizations, setUserOrganization] = useState<OrganizationModel[] | undefined>(undefined)
    const [userOrganizationsPage, setUserOrganizationsPage] = useState(1)
    const [stlElevationModalCallback, setStlElevationModalCallback] = useState<{ event: HasRequiredStlEvent } | undefined>(undefined)

    // The authenticated app context instance
    const authenticatedAppContext = useMemo(() => {
        const authenticatedAppContext: AuthenticatedAppContextType = {
            authenticatedUser: (): UserStoredSession => {
                const userSession = UserSessionStore.get()
                if (!userSession) {
                    throw new Error("No user session is stored in the app context")
                }

                return userSession
            },
            checkMinimumStl: async (stlRole: StlRole, callback: HasRequiredStlEvent) => {
                const currentSession = await AuthenticationService.fetchSessionData()

                // if the current session contains the required role, approved it
                if (currentSession.roles[stlRole]) {
                    callback({ hasRequiredStl: true })
                    return
                }

                // open the modal so the user can try to elevate its STL
                setShowStlElevationModal(true)
                setStlElevationModalCallback({ event: callback })
            },
            hasRole(roles: UserSessionRole[]): boolean {
                const userRoles = this.authenticatedUser().session.roles;
                return roles.some(role => userRoles[role]);
            },
            logout: (): Promise<void> => {
                UserSessionStore.clear()
                SessionCredentialsStore.clear()

                //
                return Promise.resolve()
            },

            refreshAuthenticatedUserSession: async () => {

                // update user data and session into the store
                const sessionCredentials = SessionCredentialsStore.get()
                if (!sessionCredentials) {
                    return Promise.reject("Session credentials does not exists on the store")
                }
                const userData = await AuthenticationService.fetchUserDataWithBearerToken(sessionCredentials)
                const userSessionFromApi = await AuthenticationService.fetchSessionDataWithBearerToken(sessionCredentials)
                const userSession = {
                    userData: userData,
                    session: userSessionFromApi
                }

                // store the session data in local storage
                UserSessionStore.store(userSession)

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

    function onStlElevationFinished(event: StlElevationEvent) {
        if (event.success && stlElevationModalCallback) {
            stlElevationModalCallback.event({
                hasRequiredStl: event.success
            })
        }

        // undef the STL elevation modal callback
        setStlElevationModalCallback(undefined)
        setShowStlElevationModal(false)
    }


    return (
        <AuthenticatedAppContext.Provider value={authenticatedAppContext}>
            <Layout>
                <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Elements aligned to the left corner */}
                    <div>
                        <Link to={'/'}>
                            <Typography style={{ color: '#ffffff', fontWeight: 700 }}>FPM Toolkit</Typography>
                        </Link>
                    </div>
                    {/* Elements aligned to the right corner */}
                    <div>
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'my-account',
                                        label: 'Minha conta',
                                        icon: <UserOutlined />,
                                        onClick: () => {
                                            navigate('/my-account')
                                        }
                                    },
                                    {
                                        key: 'logout',
                                        label: 'Sair da conta',
                                        icon: <LogoutOutlined />,
                                        onClick: () => {
                                            appContext.logout()
                                        }
                                    },
                                ]
                            }}
                        >
                            <Avatar icon={<UserOutlined />} />
                        </Dropdown>
                    </div>
                </Header>
                <div style={{ padding: '0 48px', marginTop: 32, minHeight: 'calc(100vh - 124px)' }}>
                    <Outlet />
                </div>
            </Layout>
            <StlElevationModal
                open={showStlElevationModal}
                onCancel={() => setShowStlElevationModal(false)}
                onFinish={onStlElevationFinished}
            />
        </AuthenticatedAppContext.Provider>
    )
}