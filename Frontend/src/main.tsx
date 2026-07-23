import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider from './context/auth.tsx'
import UsersProvider from './context/users.tsx'
import ServicesProvider from './context/services.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UsersProvider>
          <ServicesProvider>
            <App />
          </ServicesProvider>
        </UsersProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
