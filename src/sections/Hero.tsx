import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useMemo, useRef } from 'react'
import heroBg from '../assets/hero-bg.png'

function Stat({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' })
  const display = useMemo(() => (inView ? value : 0), [inView, value])

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-3 py-3">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="font-heading text-2xl font-extrabold text-white"
      >
        {display}
        {label === 'Projects' || label === 'Years' || label === 'Clients'
          ? '+'
          : ''}
      </motion.div>
      <div className="text-xs font-semibold text-white/70">{label}</div>
    </div>
  )
}

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const fgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0])

  const lines = [
    { kind: 'kicker', text: 'Trusted Since 2005 • 200+ Projects Delivered' },
    { kind: 'title', text: 'Building Your Vision,\nBrick by Brick.' },
    {
      kind: 'body',
      text: 'ABC Construction delivers world-class residential, commercial, and industrial projects — on time, on budget, every time.',
    },
  ] as const

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative h-[100svh] min-h-[720px] overflow-hidden"
    >
      <div className="absolute inset-0">
        <motion.img
          src={heroBg}
          alt=""
          className="h-full w-full object-cover"
          style={{ y: bgY, willChange: 'transform' }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <motion.div
          aria-hidden="true"
          className="absolute -left-28 -top-28 h-[420px] w-[420px] rounded-full bg-orange-500/25 blur-3xl"
          style={{ opacity: glowOpacity }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-sky-400/18 blur-3xl"
          style={{ y: fgY, willChange: 'transform' }}
        />
      </div>

      <div className="relative flex h-full items-stretch pt-16">
        <div className="container-page flex flex-1 items-center">
          <div className="max-w-2xl text-left">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
              }}
            >
              {lines.map((l) => (
                <motion.div
                  key={l.kind}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {l.kind === 'kicker' && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-slate-200 backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      {l.text}
                    </div>
                  )}
                  {l.kind === 'title' && (
                    <h1 className="mt-6 whitespace-pre-line font-heading text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                      {l.text}
                    </h1>
                  )}
                  {l.kind === 'body' && (
                    <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
                      {l.text}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                href="#projects"
                className="btn btn-primary group px-7"
              >
                View Our Projects
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </motion.a>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <a href="#contact" className="btn btn-outline px-7 hover:bg-white hover:text-black">
                  Get a Free Quote
                </a>
              </motion.div>
            </div>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="pointer-events-none absolute inset-x-0 bottom-7 flex items-center justify-center">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-3 text-white/80 backdrop-blur"
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>

        {/* floating stat bar */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
          <div className="container-page">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.65, ease: 'easeOut' }}
              className="mx-auto flex max-w-4xl flex-col items-stretch justify-between gap-2 rounded-2xl border border-white/15 bg-white/10 px-2 py-2 backdrop-blur md:flex-row md:gap-0 md:px-4"
            >
              <div className="grid w-full grid-cols-2 divide-y divide-white/10 md:grid-cols-4 md:divide-x md:divide-y-0">
                <Stat value={200} label="Projects" />
                <Stat value={18} label="Years" />
                <Stat value={500} label="Clients" />
                <Stat value={12} label="Cities" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

