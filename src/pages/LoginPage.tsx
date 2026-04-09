import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import heroBg from '../assets/hero-bg.png'
import { ThemeLock } from '../components/ThemeLock'
import { usePortalAuth } from '../portal/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = usePortalAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen bg-bg">
      <ThemeLock theme="dark" />
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            src={heroBg}
            alt=""
            className="h-full w-full object-cover opacity-90"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1.02 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="absolute inset-0 bg-black/65" />
          <motion.div
            aria-hidden="true"
            className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 18, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl"
            animate={{ x: [0, -24, 0], y: [0, -16, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative container-page flex min-h-screen items-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div className="card border-white/15 bg-slate-950/55 p-8 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-orange-200/90">
                    ABC CONSTRUCTION PORTAL
                  </p>
                  <h1 className="mt-2 font-heading text-3xl font-extrabold">
                    Login
                  </h1>
                </div>
                <Link
                  to="/"
                  className="text-sm font-semibold text-white/80 hover:text-white"
                >
                  Back to site
                </Link>
              </div>

              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!email.trim() || password.trim().length < 2) return
                  login({ email, password })
                  navigate('/portal/dashboard')
                }}
              >
                <div>
                  <label className="text-sm font-semibold text-white/80">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none ring-orange-500/40 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white/80">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none ring-orange-500/40 focus:ring-2"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full hover:scale-[1.02] active:scale-[0.99]"
                >
                  Login
                </button>

                <p className="pt-1 text-center text-xs text-white/60">
                  Powered by ABC Construction Portal
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

