import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToastTone = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  tone: ToastTone
  title: string
  message?: string
}

type ToastCtx = {
  push: (t: Omit<Toast, 'id'>) => void
}

const Ctx = createContext<ToastCtx | null>(null)

function uid() {
  return `toast_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function toneCls(t: ToastTone) {
  if (t === 'success') return { dot: 'bg-emerald-400', bg: 'bg-emerald-500/15 border-emerald-400/20' }
  if (t === 'error') return { dot: 'bg-red-400', bg: 'bg-red-500/15 border-red-400/20' }
  if (t === 'warning') return { dot: 'bg-orange-400', bg: 'bg-orange-500/15 border-orange-400/20' }
  return { dot: 'bg-sky-400', bg: 'bg-sky-500/15 border-sky-400/20' }
}

export function PortalToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = uid()
    setToasts((s) => [{ ...t, id }, ...s].slice(0, 4))
    window.setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id))
    }, 3000)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-5 top-5 z-[60] flex w-[360px] max-w-[92vw] flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const cls = toneCls(t.tone)
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 20, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={[
                  'pointer-events-auto rounded-2xl border p-4 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur',
                  cls.bg,
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  <div className={['mt-1 h-2.5 w-2.5 rounded-full', cls.dot].join(' ')} />
                  <div className="flex-1">
                    <div className="text-sm font-extrabold text-white">{t.title}</div>
                    {t.message && <div className="mt-1 text-xs font-semibold text-white/70">{t.message}</div>}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function usePortalToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePortalToast must be used within PortalToastProvider')
  return ctx
}

