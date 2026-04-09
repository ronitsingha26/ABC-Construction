import { motion } from 'framer-motion'
import {
  Bell,
  ChevronDown,
  Moon,
  Search,
  Sun,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { usePortalAuth } from './auth'
import { usePortalSearch } from './search'

function titleFromPath(pathname: string) {
  const p = pathname.replace(/^\/portal\/?/, '')
  const head = p.split('/')[0] || 'dashboard'
  return head.charAt(0).toUpperCase() + head.slice(1)
}

export function PortalTopbar() {
  const location = useLocation()
  const { user, logout } = usePortalAuth()
  const u = user ?? { name: 'User', role: 'Owner' as const }
  const search = usePortalSearch()
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const title = useMemo(() => titleFromPath(location.pathname), [location.pathname])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (!isCmdK) return
      e.preventDefault()
      search.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [search])

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header className="fixed left-[260px] right-0 top-0 z-30 h-16 border-b border-border bg-card/70 backdrop-blur">
      <div className="flex h-full items-center gap-4 px-6">
        <div className="min-w-[160px]">
          <div className="text-xs font-semibold text-muted">Portal</div>
          <div className="font-heading text-lg font-extrabold text-text">
            {title}
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={(el) => {
                inputRef.current = el
                search.inputRef.current = el
              }}
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              className="w-full rounded-full border border-border bg-bg/60 py-2.5 pl-11 pr-20 text-sm text-text placeholder:text-muted outline-none ring-orange-500/35 focus:ring-2"
              placeholder="Search projects, employees, invoices..."
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-bg/60 px-2 py-1 text-[11px] font-semibold text-muted">
              ⌘ K
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg/60 text-text/80 transition hover:bg-bg hover:text-text"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-extrabold text-slate-950">
              3
            </span>
          </button>

          <button
            type="button"
            onClick={theme.toggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg/60 text-text/80 transition hover:bg-bg hover:text-text"
            aria-label="Toggle theme"
          >
            {theme.isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-3 rounded-full border border-border bg-bg/60 py-1.5 pl-2 pr-3 text-sm font-semibold text-text/90 transition hover:bg-bg"
              aria-label="User menu"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  u.name,
                )}&background=0F172A&color=F8FAFC&size=72&bold=true`}
                alt={u.name}
                className="h-8 w-8 rounded-full border border-white/10"
              />
              <span className="hidden sm:inline">{u.name}</span>
              <ChevronDown className="h-4 w-4 text-muted" />
            </button>

            {open && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_80px_rgba(0,0,0,0.28)]"
              >
                <div className="border-b border-border px-4 py-3">
                  <div className="text-sm font-extrabold text-text">
                    {u.name}
                  </div>
                  <div className="text-xs font-semibold text-muted">
                    {u.role}
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-text/80 transition hover:bg-bg hover:text-text"
                >
                  Profile
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-text/80 transition hover:bg-bg hover:text-text"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-primary transition hover:bg-bg"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

