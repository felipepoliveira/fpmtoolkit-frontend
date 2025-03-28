import { Button, Dropdown, Layout, Menu } from "antd";
import { createContext, JSX, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { AppContext } from "./App";
import { Header } from "antd/es/layout/layout";
import { UserOutlined } from "@ant-design/icons";
import { AuthenticatedAppContextType, UserSession } from "./types";
import UserSessionStore from "../store/user-session";
import SessionCredentialsStore from "../store/session-credentials";
import { OrganizationModel } from "../types/backend-api/organization";
import UserOrganizationsService from "../api/backend-api/me/user-organizations";

// The authenticated app context instance
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
    }
}
export const AuthenticatedAppContext = createContext<AuthenticatedAppContextType>(authenticatedAppContext)


/**
 * Render the top menu of the authenticated layout
 */
function TopMenu() {
    const navigate = useNavigate()
    const handleLogout = () => {
        authenticatedAppContext.logout()
        navigate("/login")
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout>
            <Header style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', background: '#fff' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>MyApp</div>
                <Dropdown overlay={userMenu} trigger={["click"]}>
                    <Button icon={<UserOutlined />} type="text" style={{ marginLeft: 'auto' }}>
                        User
                    </Button>
                </Dropdown>
            </Header>
        </Layout>
    );
}


export default function AuthLayout(): JSX.Element {
    const appContext = useContext(AppContext)
    const navigate = useNavigate()
    const [state, setState] = useState<'loading' | 'error' |'ready'>('loading')
    
    /**
     * Store all organizations of the authenticated user. That includes the ones that the user is the owner or member of
     * When this state prop is marked as undefined that means that the data was not fetched from the server yet.
     */
    const [userOrganizations, setUserOrganization] = useState<OrganizationModel[] | undefined>(undefined)
    const [userOrganizationsPage, setUserOrganizationsPage] = useState(1)

    /**
     * Observe the userOrganizations state so it can fetch the authenticated user organizations
     * from the Back-end api
     */
    useEffect(() => {

        // ignore the fetching process if it is already defined
        if (userOrganizations !== undefined) {
            // if the authenticated user is not a member of any organization redirect it to the organization creation interface
            if (userOrganizations.length === 0) {
                navigate('/organizations/create')
            }
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



    // if the user is not authenticated redirect it to the login
    if (!appContext.isAuthenticated()) {
        return <Navigate to={"/login"} />
    }

    return (
        <AuthenticatedAppContext.Provider value={authenticatedAppContext}>
            <TopMenu />
            <Outlet />
        </AuthenticatedAppContext.Provider>
    )
}