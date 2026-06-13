import { motion } from 'framer-motion'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-2xl border border-border bg-white p-8"
    >
      <h1 className="font-heading text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-muted">
        This module will be built in the next phase.
      </p>
    </motion.div>
  )
}

