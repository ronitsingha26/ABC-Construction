import {
  HardHat,
  Mail,
  Globe,
  Image,
  Link as LinkIcon,
  Play,
} from 'lucide-react'
import { motion } from 'framer-motion'

const services = [
  'Residential Construction',
  'Commercial Buildings',
  'Industrial Projects',
  'Infrastructure',
  'Renovation & Interiors',
  'Architecture & Planning',
] as const

const quickLinks = ['Home', 'About', 'Projects', 'Careers', 'Privacy Policy'] as const

export function Footer() {
  return (
    <footer className="border-t border-orange-500/15 bg-[#0F172A]">
      <div className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-heading text-lg font-extrabold text-text">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 ring-1 ring-orange-400/30">
                <HardHat className="h-5 w-5 text-orange-400" />
              </span>
              <span>ABC Construction</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Building trust through quality engineering, disciplined execution,
              and transparent communication—since 2005.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: Globe, label: 'Facebook' },
                { Icon: Image, label: 'Instagram' },
                { Icon: LinkIcon, label: 'LinkedIn' },
                { Icon: Play, label: 'YouTube' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card hover:bg-slate-50 text-muted transition hover:bg-slate-100 hover:text-text"
                >
                  <s.Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-extrabold tracking-wide text-text">
              Services
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {services.map((s) => (
                <li key={s}>
                  <a href="#services" className="transition hover:text-text">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-extrabold tracking-wide text-text">
              Quick Links
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {quickLinks.map((s) => (
                <li key={s}>
                  <a href="#" className="transition hover:text-text">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-extrabold tracking-wide text-text">
              Newsletter
            </div>
            <p className="mt-4 text-sm text-muted">
              Monthly updates on projects, milestones, and insights.
            </p>
            <form className="mt-4 flex gap-2">
              <div className="flex-1">
                <label className="sr-only">Email</label>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-full border border-border bg-card hover:bg-slate-50 px-4 py-3 text-sm text-text placeholder:text-text/35 outline-none ring-orange-500/35 focus:ring-2"
                />
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary px-5 py-3"
                aria-label="Subscribe"
              >
                <Mail className="h-4 w-4" />
                Subscribe
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-text/55 sm:flex-row">
          <div>© 2026 Ronit Singha Developer. All Rights Reserved.</div>
          <div className="text-text/45">Designed for credibility & performance.</div>
        </div>
      </div>
    </footer>
  )
}

