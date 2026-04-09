import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { usePortalAuth } from './auth'

export function ProtectedPortal() {
  const { user } = usePortalAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

