import { motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  FolderOpen,
  IndianRupee,
  Package,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCountUpOnView } from '../../hooks/useCountUpOnView'
import { usePortalStore } from '../store'
import { PortalCard } from '../ui'

const months = [
  { name: 'Jan', revenue: 42, expenses: 28 },
  { name: 'Feb', revenue: 38, expenses: 31 },
  { name: 'Mar', revenue: 55, expenses: 35 },
  { name: 'Apr', revenue: 48, expenses: 29 },
  { name: 'May', revenue: 62, expenses: 40 },
  { name: 'Jun', revenue: 71, expenses: 45 },
]

function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={[
        'animate-pulse rounded-2xl border border-border bg-card hover:bg-slate-50',
        className,
      ].join(' ')}
    />
  )
}

function StatCard({
  title,
  Icon,
  value,
  sub,
  subTone,
  prefix = '',
  suffix = '',
  delayMs,
}: {
  title: string
  Icon: typeof FolderOpen
  value: number
  sub: string
  subTone: 'green' | 'orange' | 'red'
  prefix?: string
  suffix?: string
  delayMs: number
}) {
  const { ref, inView, display } = useCountUpOnView({
    value,
    durationMs: 900,
    delayMs,
  })

  const subClass =
    subTone === 'green'
      ? 'text-emerald-600'
      : subTone === 'orange'
        ? 'text-orange-700'
        : 'text-red-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: delayMs / 1000 }}
    >
      <PortalCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-muted">{title}</div>
            <div ref={ref} className="mt-2 font-heading text-3xl font-extrabold tracking-tight">
              {prefix}
              {inView ? display : 0}
              {suffix}
            </div>
          </div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
            <Icon className="h-6 w-6 text-orange-400" />
          </div>
        </div>
        <div className={`mt-3 text-xs font-semibold ${subClass}`}>{sub}</div>
      </PortalCard>
    </motion.div>
  )
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-orange-400"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export function DashboardPage() {
  const store = usePortalStore()
  const [loading] = useState(false)

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  const today = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date())
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-80 lg:col-span-3" />
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-96 lg:col-span-3" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    )
  }

  const totalProjects = store.projects.length
  const activeProjects = store.projects.filter((p) => p.status === 'Ongoing' || p.status === 'Delayed').length
  const delayed = store.projects.filter((p) => p.status === 'Delayed').length
  const revenueCr = 4.8
  const pendingLakh = 68

  const totalEmployees = store.employees.length
  const lowStockCount = store.materials.filter((m) => Math.max(0, m.total - m.used) < m.minStock).length

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-border bg-gradient-to-r from-slate-800/45 to-slate-800/25 px-6 py-5"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-muted">{today}</div>
            <div className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-text">
              {greeting}, Rajesh <span aria-hidden="true">👷</span>
            </div>
            <div className="mt-1 text-sm text-muted">
              Here’s what’s happening across projects, inventory and finance today.
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 md:mt-0 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-muted">Employees</div>
              <div className="mt-1 text-sm font-extrabold text-text">{totalEmployees}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-muted">Low Stock</div>
              <div className="mt-1 text-sm font-extrabold text-orange-700">{lowStockCount}</div>
            </div>
            <div className="hidden rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-3 md:block">
              <div className="text-xs font-semibold text-muted">Delayed</div>
              <div className="mt-1 text-sm font-extrabold text-red-700">{delayed}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          Icon={FolderOpen}
          value={totalProjects}
          sub="+3 this month"
          subTone="green"
          delayMs={0}
        />
        <StatCard
          title="Active Projects"
          Icon={Activity}
          value={activeProjects}
          sub={`${delayed} delayed`}
          subTone="orange"
          delayMs={80}
        />
        <StatCard
          title="Total Revenue"
          Icon={IndianRupee}
          value={48}
          prefix="₹"
          suffix=" L"
          sub="+12% vs last month"
          subTone="green"
          delayMs={160}
        />
        <StatCard
          title="Pending Payments"
          Icon={AlertCircle}
          value={pendingLakh}
          prefix="₹"
          suffix=" L"
          sub="5 invoices"
          subTone="red"
          delayMs={240}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <PortalCard className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-heading text-lg font-extrabold">
                Revenue vs Expenses
              </div>
              <div className="text-xs font-semibold text-muted">
                Last 6 months
              </div>
            </div>
            <div className="text-xs font-semibold text-muted">₹ in Lakhs</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(0,0,0,0.4)" />
                <YAxis stroke="rgba(0,0,0,0.4)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 14,
                    color: 'var(--color-text)',
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (L)" fill="#F97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses (L)" fill="#64748b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PortalCard>

        <PortalCard className="lg:col-span-2">
          <div className="font-heading text-lg font-extrabold">Today at a glance</div>
          <div className="mt-1 text-xs font-semibold text-muted">Operational quick stats</div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card hover:bg-slate-50">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-text">Employees</div>
                  <div className="text-xs font-semibold text-muted">Total workforce</div>
                </div>
              </div>
              <div className="text-lg font-extrabold text-text">{totalEmployees}</div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card hover:bg-slate-50">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-text">Low stock alerts</div>
                  <div className="text-xs font-semibold text-muted">Needs procurement</div>
                </div>
              </div>
              <div className="text-lg font-extrabold text-orange-700">{lowStockCount}</div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card hover:bg-slate-50">
                  <IndianRupee className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-text">Revenue</div>
                  <div className="text-xs font-semibold text-muted">Total (demo)</div>
                </div>
              </div>
              <div className="text-lg font-extrabold text-text">₹{revenueCr} Cr</div>
            </div>
          </div>
        </PortalCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <PortalCard className="lg:col-span-3">
          <div className="mb-4">
            <div className="font-heading text-lg font-extrabold">Recent Projects</div>
            <div className="text-xs font-semibold text-muted">Live from portal store</div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-card hover:bg-slate-50 text-xs font-bold text-muted">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {store.projects.slice(0, 5).map((p) => {
                  const c = store.clients.find((x) => x.id === p.clientId)?.name ?? '—'
                  const tone =
                    p.status === 'Completed'
                      ? 'bg-emerald-500/15 text-emerald-700'
                      : p.status === 'Ongoing'
                        ? 'bg-orange-500/15 text-orange-700'
                        : p.status === 'Delayed'
                          ? 'bg-red-500/15 text-red-700'
                          : 'bg-blue-500/15 text-blue-700'
                  return (
                    <tr key={p.id} className="text-secondary">
                      <td className="px-4 py-3 font-semibold text-text">{p.name}</td>
                      <td className="px-4 py-3">{c}</td>
                      <td className="px-4 py-3">₹{new Intl.NumberFormat('en-IN').format(p.budgetRupees)}</td>
                      <td className="px-4 py-3">
                        <span className={['rounded-full px-3 py-1 text-xs font-bold', tone].join(' ')}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Progress value={p.progress} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </PortalCard>

        <PortalCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-heading text-lg font-extrabold">Activity Feed</div>
              <div className="text-xs font-semibold text-muted">Latest updates</div>
            </div>
            <span className="text-xs font-semibold text-muted">Live</span>
          </div>

          <div className="max-h-[340px] space-y-3 overflow-auto pr-2">
            {[
              { dot: 'orange', text: 'Material request raised — Project Skyline', time: '12m ago' },
              { dot: 'green', text: 'Payment received ₹12L — DLF Ltd', time: '1h ago' },
              { dot: 'red', text: 'Task overdue — Foundation work — Aurora Park', time: '3h ago' },
              { dot: 'orange', text: 'New employee added — Suresh Kumar', time: '5h ago' },
              { dot: 'green', text: 'Project completed — GreenVilla Apts', time: 'Yesterday' },
              { dot: 'orange', text: 'Vendor invoice submitted — Steel supply', time: 'Yesterday' },
              { dot: 'green', text: 'Client meeting scheduled — City Mall', time: '2 days ago' },
              { dot: 'red', text: 'Low stock alert — Cement (OPC 53)', time: '2 days ago' },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card hover:bg-slate-50 p-4">
                <span
                  className={[
                    'mt-1.5 h-2.5 w-2.5 rounded-full',
                    a.dot === 'green'
                      ? 'bg-emerald-400'
                      : a.dot === 'red'
                        ? 'bg-red-400'
                        : 'bg-orange-400',
                  ].join(' ')}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text">{a.text}</div>
                  <div className="mt-1 text-xs font-semibold text-muted">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard>
          <div className="mb-4">
            <div className="font-heading text-lg font-extrabold">Upcoming Deadlines</div>
            <div className="text-xs font-semibold text-muted">Next 5 milestones</div>
          </div>
          <div className="space-y-3">
            {[
              { date: '12 Apr', project: 'Skyline Towers', days: 4 },
              { date: '17 Apr', project: 'City Mall Complex', days: 9 },
              { date: '22 Apr', project: 'NH-44 Extension', days: 14 },
              { date: '28 Apr', project: 'Aurora Park', days: 20 },
              { date: '02 May', project: 'TechPark Hub', days: 24 },
            ].map((d) => (
              <div key={d.project} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card hover:bg-slate-50 p-4">
                <div>
                  <div className="text-xs font-semibold text-muted">{d.date}</div>
                  <div className="text-sm font-extrabold text-text">{d.project}</div>
                </div>
                <div className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-extrabold text-orange-700">
                  {d.days} days
                </div>
              </div>
            ))}
          </div>
        </PortalCard>

        <PortalCard>
          <div className="mb-4">
            <div className="font-heading text-lg font-extrabold">Low Stock Alerts</div>
            <div className="text-xs font-semibold text-muted">Top 5 materials</div>
          </div>
          <div className="space-y-4">
            {store.materials
              .map((m) => ({
                name: m.name,
                pct: Math.round((Math.max(0, m.total - m.used) / Math.max(1, m.minStock)) * 100),
              }))
              .sort((a, b) => a.pct - b.pct)
              .slice(0, 5)
              .map((m) => (
              <div key={m.name} className="rounded-2xl border border-border bg-card hover:bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-text">{m.name}</div>
                  <div className="text-xs font-extrabold text-red-700">{m.pct}%</div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${Math.min(100, m.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PortalCard>
      </div>
    </div>
  )
}

