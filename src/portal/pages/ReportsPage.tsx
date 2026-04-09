import { Download, Printer, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo, useState } from 'react'
import { usePortalStore } from '../store'
import { EmptyState, PortalButton, PortalCard, TableShell } from '../ui'

type ReportId =
  | 'projectProgress'
  | 'revExp'
  | 'attendance'
  | 'materialConsumption'
  | 'vendorPayments'
  | 'clientRevenue'

const reportCards: Array<{ id: ReportId; title: string; subtitle: string }> = [
  {
    id: 'projectProgress',
    title: 'Project Progress Report',
    subtitle: 'Horizontal bar chart — % complete per project',
  },
  {
    id: 'revExp',
    title: 'Revenue & Expense Report',
    subtitle: 'Line chart — monthly (12 months)',
  },
  {
    id: 'attendance',
    title: 'Employee Attendance Report',
    subtitle: 'Table + pie chart (Present/Absent/Leave %)',
  },
  {
    id: 'materialConsumption',
    title: 'Material Consumption Report',
    subtitle: 'Bar chart by material category',
  },
  {
    id: 'vendorPayments',
    title: 'Vendor Payment Report',
    subtitle: 'Table — total paid per vendor',
  },
  {
    id: 'clientRevenue',
    title: 'Client-wise Revenue Report',
    subtitle: 'Pie chart — revenue contribution per client',
  },
]

function exportCsv(filename: string, rows: Array<Record<string, string | number>>) {
  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
  const lines = [
    keys.join(','),
    ...rows.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage() {
  const store = usePortalStore()
  const [active, setActive] = useState<ReportId>('projectProgress')
  const [from, setFrom] = useState('2026-01-01')
  const [to, setTo] = useState('2026-12-31')

  const progressData = useMemo(() => {
    return store.projects
      .map((p) => ({ name: p.name, progress: p.progress }))
      .sort((a, b) => b.progress - a.progress)
  }, [store.projects])

  const monthlyRevExp = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    // Demo: derive from transactions (cleared only), bucket by month of date
    const base = months.map((m) => ({ m, revenue: 0, expense: 0 }))
    for (const t of store.transactions) {
      if (!t.date || t.status !== 'Cleared') continue
      const month = Number(t.date.slice(5, 7)) - 1
      if (month < 0 || month > 11) continue
      if (t.type === 'Income') base[month]!.revenue += t.amountRupees
      if (t.type === 'Expense') base[month]!.expense += t.amountRupees
    }
    return base.map((r) => ({
      name: r.m,
      revenue: Math.round(r.revenue / 100000), // in Lakh
      expense: Math.round(r.expense / 100000),
    }))
  }, [store.transactions])

  const attendance = useMemo(() => {
    // Demo: simple distribution from employee status
    const total = store.employees.length || 1
    const onLeave = store.employees.filter((e) => e.status === 'On Leave').length
    const present = Math.max(0, total - onLeave - Math.round(total * 0.08))
    const absent = Math.max(0, total - onLeave - present)
    return {
      pie: [
        { name: 'Present', value: present },
        { name: 'Absent', value: absent },
        { name: 'Leave', value: onLeave },
      ],
      table: store.employees.slice(0, 12).map((e) => ({
        employee: `${e.name} (${e.employeeId})`,
        role: e.role,
        status: e.status,
      })),
      total,
    }
  }, [store.employees])

  const materialConsumption = useMemo(() => {
    const groups = new Map<string, number>()
    for (const m of store.materials) {
      groups.set(m.category, (groups.get(m.category) ?? 0) + m.used)
    }
    return Array.from(groups.entries())
      .map(([cat, used]) => ({ cat, used }))
      .sort((a, b) => b.used - a.used)
  }, [store.materials])

  const vendorPayments = useMemo(() => {
    // Demo: use pendingPayment as "pending", and derive "paid" from materials value * utilization
    return store.vendors.map((v) => {
      const mats = store.materials.filter((m) => m.vendorId === v.id)
      const approxPaid = mats.reduce((a, m) => a + (m.unitPriceRupees ?? 0) * Math.min(m.used, m.total), 0)
      return {
        vendor: v.name,
        city: v.city,
        category: v.category,
        totalPaidRupees: approxPaid,
        pendingRupees: v.pendingPaymentRupees ?? 0,
      }
    })
  }, [store.materials, store.vendors])

  const clientRevenue = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of store.transactions) {
      if (t.type !== 'Income' || t.status !== 'Cleared' || !t.projectId) continue
      const proj = store.projects.find((p) => p.id === t.projectId)
      if (!proj) continue
      map.set(proj.clientId, (map.get(proj.clientId) ?? 0) + t.amountRupees)
    }
    const rows = Array.from(map.entries()).map(([clientId, amount]) => {
      const c = store.clients.find((x) => x.id === clientId)
      return { name: c?.name ?? clientId, amount }
    })
    return rows.length ? rows : store.clients.slice(0, 5).map((c, i) => ({ name: c.name, amount: (5 - i) * 220000 }))
  }, [store.clients, store.projects, store.transactions])

  const colors = ['#F97316', '#22c55e', '#60a5fa', '#ef4444', '#a855f7', '#eab308', '#14b8a6', '#fb7185']

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-2xl font-extrabold text-white">Reports</div>
          <div className="mt-1 text-sm text-white/60">Operational analytics and exports.</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PortalButton
            variant="outline"
            onClick={() => {
              const now = new Date().toISOString().slice(0, 10)
              exportCsv(`report-${active}-${now}.csv`, [{ report: active, from, to }])
            }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </PortalButton>
          <PortalButton variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </PortalButton>
        </div>
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-3">
        {reportCards.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActive(r.id)}
            className="text-left"
          >
            <PortalCard
              className={[
                'transition',
                active === r.id ? 'border-orange-400/30 bg-orange-500/5' : 'hover:bg-white/5',
              ].join(' ')}
            >
              <div className="font-heading text-lg font-extrabold text-white">{r.title}</div>
              <div className="mt-1 text-sm text-white/60">{r.subtitle}</div>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-white/55">
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                Click to expand
              </div>
            </PortalCard>
          </button>
        ))}
      </div>

      <PortalCard>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-heading text-lg font-extrabold text-white">
              {reportCards.find((r) => r.id === active)?.title}
            </div>
            <div className="mt-1 text-xs font-semibold text-white/55">
              Date range is a demo filter (From / To).
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <div className="text-xs font-semibold text-white/55">From</div>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none ring-orange-500/35 focus:ring-2"
              />
            </div>
            <div className="grid gap-1">
              <div className="text-xs font-semibold text-white/55">To</div>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none ring-orange-500/35 focus:ring-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {active === 'projectProgress' && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(2,6,23,0.95)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      color: 'white',
                    }}
                    formatter={(v) => [`${v}%`, 'Progress']}
                  />
                  <Bar dataKey="progress" fill="#F97316" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {active === 'revExp' && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevExp}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(2,6,23,0.95)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      color: 'white',
                    }}
                    formatter={(v) => [`₹${v} L`, '']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {active === 'attendance' && (
            <div className="grid gap-6 lg:grid-cols-5">
              <PortalCard className="lg:col-span-2">
                <div className="font-heading text-lg font-extrabold text-white">Attendance Split</div>
                <div className="mt-1 text-xs font-semibold text-white/55">Demo snapshot</div>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={attendance.pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                        {attendance.pie.map((_, i) => (
                          <Cell key={i} fill={colors[i % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(2,6,23,0.95)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 12,
                          color: 'white',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </PortalCard>
              <PortalCard className="lg:col-span-3">
                <div className="font-heading text-lg font-extrabold text-white">Employee Snapshot</div>
                <div className="mt-1 text-xs font-semibold text-white/55">First 12 employees</div>
                <div className="mt-4">
                  <TableShell>
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 text-xs font-bold text-white/60">
                        <tr>
                          <th className="px-5 py-3">Employee</th>
                          <th className="px-5 py-3">Role</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {attendance.table.map((r) => (
                          <tr key={r.employee} className="text-white/80">
                            <td className="px-5 py-4 font-semibold text-white">{r.employee}</td>
                            <td className="px-5 py-4">{r.role}</td>
                            <td className="px-5 py-4">{r.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableShell>
                </div>
              </PortalCard>
            </div>
          )}

          {active === 'materialConsumption' && (
            materialConsumption.length === 0 ? (
              <EmptyState title="No material usage" subtitle="No materials found in the store." />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialConsumption}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="cat" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(2,6,23,0.95)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 12,
                        color: 'white',
                      }}
                    />
                    <Bar dataKey="used" fill="#F97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          )}

          {active === 'vendorPayments' && (
            <div>
              <TableShell>
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-xs font-bold text-white/60">
                    <tr>
                      <th className="px-5 py-3">Vendor</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">City</th>
                      <th className="px-5 py-3 text-right">Total Paid</th>
                      <th className="px-5 py-3 text-right">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {vendorPayments.map((v) => (
                      <tr key={v.vendor} className="text-white/80">
                        <td className="px-5 py-4 font-semibold text-white">{v.vendor}</td>
                        <td className="px-5 py-4">{v.category}</td>
                        <td className="px-5 py-4">{v.city}</td>
                        <td className="px-5 py-4 text-right font-extrabold text-white">
                          ₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v.totalPaidRupees)}
                        </td>
                        <td className="px-5 py-4 text-right font-extrabold text-orange-200">
                          ₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v.pendingRupees)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            </div>
          )}

          {active === 'clientRevenue' && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={clientRevenue} dataKey="amount" nameKey="name" innerRadius={55} outerRadius={90}>
                    {clientRevenue.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(2,6,23,0.95)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 12,
                      color: 'white',
                    }}
                    formatter={(v) => [
                      `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(v))}`,
                      'Revenue',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </PortalCard>
    </div>
  )
}

