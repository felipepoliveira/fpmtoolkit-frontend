import { message as messageApi, notification as notificationApi } from 'antd'
import { createContext, useMemo, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
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
import { AppContextType, EmailAndPasswordCredentials, UserSession } from './types'
import OrganizationHomePage from './organizations/o/[profileName]/OrganizationHomePage'
import OrganizationMembersPage from './organizations/o/[profileName]/members/OrganizationMembersPage'



export const AppContext = createContext<AppContextType>({} as AppContextType)

function App() {
  
  const [message, messageContextHolder] = messageApi.useMessage()
  const [notification, notificationContextHolder] = notificationApi.useNotification()
  const [userSession, setUserSession] = useState<UserSession | undefined>(UserSessionStore.get())

  const appContext = useMemo<AppContextType>(() => ({

    isAuthenticated: (): boolean => {
      return (UserSessionStore.get() !== undefined && SessionCredentialsStore.get() !== undefined)
    },

    login: async (credentials: EmailAndPasswordCredentials): Promise<UserSession> => {
      try {
        // Call the authentication service to generate a token
        const authenticationResponse = await AuthenticationService.generateAuthenticationTokenWithEmailAndPassword(
          { primaryEmail: credentials.email, password: credentials.password }
        )

        // Fetch user data with the generated token
        const userData = await AuthenticationService.fetchUserDataWithBearerToken(authenticationResponse.token)
        const userSession = {
          userData: userData,
          sessionExpiresAt: authenticationResponse.payload.expiresAt
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
            <Route path='/o/:profileName' element={<OrganizationHomePage />} />
            <Route path='/o/:profileName/members' element={<OrganizationMembersPage />} />
            <Route path='/organizations/create' element={<CreateOrganizationPage />} />
          </Route>

          {/* Unauthenticated pages */}
          <Route path='/create-account' element={<CreateAccountPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/password-recovery' element={<PasswordRecoveryPage />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}

export default App
