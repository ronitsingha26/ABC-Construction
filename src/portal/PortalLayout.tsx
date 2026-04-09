import { AnimatePresence, motion } from 'framer-motion'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BrandedLoader } from '../components/BrandedLoader'
import { PortalSidebar } from './PortalSidebar'
import { PortalTopbar } from './PortalTopbar'

function RouteFallback() {
  return (
    <BrandedLoader label="Loading workspace…" />
  )
}

export function PortalLayout() {
  const location = useLocation()
  return (
    <div className="relative min-h-screen bg-bg text-text">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 520px at 18% 10%, rgba(249,115,22,0.16), transparent 60%), radial-gradient(800px 520px at 78% 18%, rgba(56,189,248,0.12), transparent 60%)',
        }}
      />
      <PortalSidebar />
      <PortalTopbar />
      <main className="ml-[260px] pt-16">
        <div className="min-h-[calc(100vh-4rem)] p-6">
          <Suspense fallback={<RouteFallback />}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </div>
      </main>
    </div>
  )
}

