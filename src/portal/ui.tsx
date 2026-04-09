import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export function PortalCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-border bg-card/80 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur transition will-change-transform hover:-translate-y-[2px] hover:shadow-[0_26px_110px_rgba(0,0,0,0.22)]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function Badge({
  tone,
  children,
}: {
  tone: 'green' | 'orange' | 'red' | 'blue' | 'slate'
  children: React.ReactNode
}) {
  const cls =
    tone === 'green'
      ? 'bg-emerald-500/15 text-emerald-200'
      : tone === 'orange'
        ? 'bg-orange-500/15 text-orange-200'
        : tone === 'red'
          ? 'bg-red-500/15 text-red-200'
          : tone === 'blue'
            ? 'bg-blue-500/15 text-blue-200'
            : 'bg-white/10 text-white/70'
  return (
    <span className={['rounded-full px-3 py-1 text-xs font-bold', cls].join(' ')}>
      {children}
    </span>
  )
}

export function PortalButton({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  className = '',
  disabled,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg will-change-transform'
  const v =
    variant === 'primary'
      ? 'bg-orange-500 text-slate-950 hover:bg-orange-400'
      : variant === 'outline'
        ? 'border border-border bg-bg/60 text-text/85 hover:bg-bg'
        : 'text-text/80 hover:bg-bg hover:text-text'
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.015, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        base,
        v,
        disabled ? 'cursor-not-allowed opacity-60' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.button>
  )
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-bg/60 px-4 py-3 text-sm text-text placeholder:text-muted outline-none ring-orange-500/35 focus:ring-2"
      />
    </div>
  )
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border bg-bg/60 px-4 py-3 text-sm text-text outline-none ring-orange-500/35 focus:ring-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-card text-text">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close modal overlay"
      />
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 w-[94vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_140px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="font-heading text-lg font-extrabold text-text">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg/60 text-text/80 transition hover:bg-bg hover:text-text"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-border px-6 py-4">{footer}</div>}
      </motion.div>
    </div>
  )
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-8 text-center backdrop-blur">
      <div className="font-heading text-xl font-extrabold text-text">{title}</div>
      <div className="mt-2 text-sm text-muted">{subtitle}</div>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function TableShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur">
      {children}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={['animate-pulse rounded-2xl bg-black/5 dark:bg-white/5', className].join(' ')} />
}

export function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'This cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  tone = 'danger',
  onConfirm,
  onClose,
}: {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  tone?: 'danger' | 'warning'
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <PortalButton variant="outline" onClick={onClose}>
            {cancelText}
          </PortalButton>
          <PortalButton
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={tone === 'danger' ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-orange-500 text-slate-950 hover:bg-orange-400'}
          >
            {confirmText}
          </PortalButton>
        </div>
      }
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        {message}
      </div>
    </Modal>
  )
}


