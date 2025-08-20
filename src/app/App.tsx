import { message as messageApi, notification as notificationApi } from 'antd'
import { createContext, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router'
import AuthenticationService from '../api/backend-api/authentication'
import SessionCredentialsStore from '../store/session-credentials'
import UserSessionStore from '../store/user-session'
import './App.css'
import AuthLayout from './AuthenticatedApp'
import CreateAccountPage from './create-account/CreateAccountPage'
import Home from './Home'
import LoginPage from './login/LoginPage'
import CreateOrganizationPage from './organizations/create/CreateOrganizationPage'
import PasswordRecoveryPage from './password-recovery/PasswordRecoveryPage'
import { AppContextType, EmailAndPasswordCredentials, UserStoredSession } from './types'
import OrganizationHomePage from './o/[profileName]/OrganizationHomePage'
import OrganizationMembersPage from './o/[profileName]/members/OrganizationMembersPage'
import MyAccountPage from './my-account/MyAccountPage'
import JoinOrganizationPage from './join-organization/JoinOrganizationPage'
import ConfirmEmailPage from './confirm-email/ConfirmEmailPage'
import OrganizationProjectsListPage from './o/[profileName]/projects/OrganizationProjectsListPage'
import ProjectHomePage from './o/[profileName]/p/[profileName]/ProjectHomePage'



export const AppContext = createContext<AppContextType>({} as AppContextType)

function App() {
  
  const [message, messageContextHolder] = messageApi.useMessage()
  const [notification, notificationContextHolder] = notificationApi.useNotification()
  const [userSession, setUserSession] = useState<UserStoredSession | undefined>(UserSessionStore.get())

  const appContext = useMemo<AppContextType>(() => ({

    isAuthenticated: (): boolean => {
      return (UserSessionStore.get() !== undefined && SessionCredentialsStore.get() !== undefined)
    },

    login: async (credentials: EmailAndPasswordCredentials): Promise<UserStoredSession> => {
      try {
        // Call the authentication service to generate a token
        const authenticationResponse = await AuthenticationService.generateAuthenticationTokenWithEmailAndPassword(
          { primaryEmail: credentials.email, password: credentials.password }
        )

        // Fetch user data with the generated token
        const userData = await AuthenticationService.fetchUserDataWithBearerToken(authenticationResponse.token)
        const userSessionFromApi = await AuthenticationService.fetchSessionDataWithBearerToken(authenticationResponse.token)
        const userSession = {
          userData: userData,
          session: userSessionFromApi
        }

        // Store the user session in the local storage
        UserSessionStore.store(userSession)
        SessionCredentialsStore.store(authenticationResponse.token)

        // Update the state
        setUserSession(userSession)

        return userSession
      } catch (e) {
        throw e
      }
    },
    logout: () => {
      // Store the user session in the local storage
      localStorage.clear()

      window.location.replace('/login')

      return Promise.resolve()
    },
    message,
    notification,
  }), [message, notification])

  return (
    <AppContext.Provider value={appContext}>
      {messageContextHolder}
      {notificationContextHolder}
      <BrowserRouter>
        <Routes>
          {/* Authenticated-only pages */}
          <Route element={<AuthLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/confirm-email' element={<ConfirmEmailPage />} />
            <Route path='/my-account' element={<MyAccountPage />} />
            <Route path='/o/:profileName' element={<OrganizationHomePage />} />
            <Route path='/o/:profileName/members' element={<OrganizationMembersPage />} />
            <Route path='/o/:profileName/p/:projectProfileName' element={<ProjectHomePage />} />
            <Route path='/o/:profileName/projects' element={<OrganizationProjectsListPage />} />
            <Route path='/organizations/create' element={<CreateOrganizationPage />} />
          </Route>

          {/* Unauthenticated pages */}
          <Route path='/create-account' element={<CreateAccountPage />} />
          <Route path='/join-organization' element={<JoinOrganizationPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/password-recovery' element={<PasswordRecoveryPage />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
