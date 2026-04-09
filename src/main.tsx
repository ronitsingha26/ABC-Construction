import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PortalAuthProvider } from './portal/auth'
import { PortalStoreProvider } from './portal/store'
import { PortalSearchProvider } from './portal/search'
import { PortalToastProvider } from './portal/toast'
import { initTheme } from './lib/theme'
import './index.css'
import App from './App.tsx'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PortalAuthProvider>
        <PortalSearchProvider>
          <PortalToastProvider>
            <PortalStoreProvider>
              <App />
            </PortalStoreProvider>
          </PortalToastProvider>
        </PortalSearchProvider>
      </PortalAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
