import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'
import AuthLayout from './AuthLayout'
import CreateOrganizationPage from './organizations/create/CreateOrganizationPage'
import LoginPage from './login/LoginPage'
import CreateAccountPage from './create-account/CreateAccountPage'
import { notification as NotificationApi } from 'antd'
import { createContext, useMemo } from 'react'
import { NotificationInstance } from 'antd/es/notification/interface'
import PasswordRecoveryPage from './password-recovery/PasswordRecoveryPage'

interface AppContextType {
  notification: NotificationInstance
}

export const AppContext = createContext<AppContextType>({} as AppContextType)

function App() {

  const [notification, contextHolder] = NotificationApi.useNotification()
  const appContextValue = useMemo<AppContextType>(() => ({ notification: notification  }), [])
  
  return (
    <AppContext.Provider value={appContextValue}>
      {contextHolder}
      <BrowserRouter>
        <Routes>
          {/* Authenticated-only pages */}
          <Route element={<AuthLayout />}>
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
