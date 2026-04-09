import { motion } from 'framer-motion'
import { HardHat, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { portalNav } from './portalNav'
import { usePortalAuth } from './auth'

export function PortalSidebar() {
  const { user, logout } = usePortalAuth()
  const u = user ?? { name: 'User', role: 'Owner' as const }
  const items = user ? portalNav.filter((i) => i.roles.includes(user.role)) : portalNav

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-border bg-card/80 backdrop-blur">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 px-5">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 ring-1 ring-orange-400/30">
            <HardHat className="h-5 w-5 text-orange-400" />
          </span>
          <div className="leading-tight">
            <div className="font-heading text-sm font-extrabold text-text">
              ABC Construction
            </div>
            <div className="text-xs font-semibold text-muted">Portal</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-2">
          <div className="space-y-1.5">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition will-change-transform hover:translate-x-[2px]',
                    isActive
                      ? 'border-l-4 border-orange-400 bg-bg text-text shadow-[0_10px_30px_rgba(0,0,0,0.18)]'
                      : 'text-muted hover:bg-bg hover:text-text',
                  ].join(' ')
                }
                end={item.to === '/portal/dashboard'}
              >
                <item.Icon className="h-5 w-5 text-orange-400/90" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                u.name,
              )}&background=0F172A&color=F8FAFC&size=96&bold=true`}
              alt={u.name}
              className="h-11 w-11 rounded-2xl border border-border"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-text">
                {u.name}
              </div>
              <div className="text-xs font-semibold text-muted">
                {u.role}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg/60 px-4 py-2.5 text-sm font-semibold text-text/80 transition hover:bg-bg hover:text-text"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </motion.button>
        </div>
      </div>
    </aside>
  )
}

