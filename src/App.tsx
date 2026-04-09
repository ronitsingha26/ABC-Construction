import { AnimatePresence, motion } from 'framer-motion'
import { lazy } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ScrollProgressBar } from './components/ScrollProgressBar'
import { SmoothScroll } from './components/SmoothScroll'
import { LandingPage } from './pages/LandingPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { PortalLayout } from './portal/PortalLayout'
import { ProtectedPortal } from './portal/ProtectedPortal'
import { RequireRole } from './portal/RequireRole'

const DashboardPage = lazy(() =>
  import('./portal/pages/DashboardPage.tsx').then((m) => ({ default: m.DashboardPage })),
)
const ProjectsPage = lazy(() =>
  import('./portal/pages/ProjectsPage.tsx').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectDetailPage = lazy(() =>
  import('./portal/pages/ProjectDetailPage.tsx').then((m) => ({ default: m.ProjectDetailPage })),
)
const EmployeesPage = lazy(() =>
  import('./portal/pages/EmployeesPage.tsx').then((m) => ({ default: m.EmployeesPage })),
)
const EmployeeDetailPage = lazy(() =>
  import('./portal/pages/EmployeeDetailPage.tsx').then((m) => ({ default: m.EmployeeDetailPage })),
)
const PayrollPage = lazy(() =>
  import('./portal/pages/PayrollPage.tsx').then((m) => ({ default: m.PayrollPage })),
)
const InventoryPage = lazy(() =>
  import('./portal/pages/InventoryPage.tsx').then((m) => ({ default: m.InventoryPage })),
)
const FinancePage = lazy(() =>
  import('./portal/pages/FinancePage.tsx').then((m) => ({ default: m.FinancePage })),
)
const ClientsPage = lazy(() =>
  import('./portal/pages/ClientsPage.tsx').then((m) => ({ default: m.ClientsPage })),
)
const ClientDetailPage = lazy(() =>
  import('./portal/pages/ClientDetailPage.tsx').then((m) => ({ default: m.ClientDetailPage })),
)
const VendorsPage = lazy(() =>
  import('./portal/pages/VendorsPage.tsx').then((m) => ({ default: m.VendorsPage })),
)
const VendorDetailPage = lazy(() =>
  import('./portal/pages/VendorDetailPage.tsx').then((m) => ({ default: m.VendorDetailPage })),
)
const ReportsPage = lazy(() =>
  import('./portal/pages/ReportsPage.tsx').then((m) => ({ default: m.ReportsPage })),
)
const SettingsPage = lazy(() =>
  import('./portal/pages/SettingsPage.tsx').then((m) => ({ default: m.SettingsPage })),
)

function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-bg">
      <SmoothScroll />
      <ScrollProgressBar />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <LandingPage />
              </motion.div>
            }
          />
          <Route
            path="/login"
            element={
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <LoginPage />
              </motion.div>
            }
          />

          <Route path="/portal" element={<ProtectedPortal />}>
            <Route element={<PortalLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route
                path="projects"
                element={
                  <RequireRole roles={['Owner', 'Project Manager', 'Site Engineer']}>
                    <ProjectsPage />
                  </RequireRole>
                }
              />
              <Route
                path="projects/:id"
                element={
                  <RequireRole roles={['Owner', 'Project Manager', 'Site Engineer']}>
                    <ProjectDetailPage />
                  </RequireRole>
                }
              />
              <Route
                path="employees"
                element={
                  <RequireRole roles={['Owner', 'HR', 'Project Manager']}>
                    <EmployeesPage />
                  </RequireRole>
                }
              />
              <Route
                path="employees/:id"
                element={
                  <RequireRole roles={['Owner', 'HR', 'Project Manager']}>
                    <EmployeeDetailPage />
                  </RequireRole>
                }
              />
              <Route
                path="payroll"
                element={
                  <RequireRole roles={['Owner', 'Accounts', 'HR']}>
                    <PayrollPage />
                  </RequireRole>
                }
              />
              <Route
                path="inventory"
                element={
                  <RequireRole roles={['Owner', 'Project Manager', 'Site Engineer']}>
                    <InventoryPage />
                  </RequireRole>
                }
              />
              <Route
                path="finance"
                element={
                  <RequireRole roles={['Owner', 'Accounts']}>
                    <FinancePage />
                  </RequireRole>
                }
              />
              <Route
                path="clients"
                element={
                  <RequireRole roles={['Owner', 'Project Manager', 'Accounts']}>
                    <ClientsPage />
                  </RequireRole>
                }
              />
              <Route
                path="clients/:id"
                element={
                  <RequireRole roles={['Owner', 'Project Manager', 'Accounts']}>
                    <ClientDetailPage />
                  </RequireRole>
                }
              />
              <Route
                path="vendors"
                element={
                  <RequireRole roles={['Owner', 'Project Manager', 'Accounts']}>
                    <VendorsPage />
                  </RequireRole>
                }
              />
              <Route
                path="vendors/:id"
                element={
                  <RequireRole roles={['Owner', 'Project Manager', 'Accounts']}>
                    <VendorDetailPage />
                  </RequireRole>
                }
              />
              <Route
                path="reports"
                element={
                  <RequireRole roles={['Owner', 'Project Manager', 'Accounts']}>
                    <ReportsPage />
                  </RequireRole>
                }
              />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <div className="container-page py-24">
                <h1 className="font-heading text-4xl font-extrabold">
                  Page not found
                </h1>
                <p className="mt-3 text-muted">
                  The page you’re looking for doesn’t exist.
                </p>
              </div>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
