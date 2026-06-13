import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePortalStore, type AttendanceDayStatus, type EmployeePayrollRow } from '../store'
import { Badge, EmptyState, PortalCard, TableShell } from '../ui'

const toneForEmpStatus = (s: string) => (s === 'Active' ? 'green' : 'orange')

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, (m ?? 1) - 1, 1)
  return d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
}

function generateMonth(seed: number, ym: string) {
  // deterministic 35-cell calendar
  const cells: AttendanceDayStatus[] = []
  let present = 0
  let absent = 0
  let halfDay = 0
  let holidays = 0
  for (let i = 0; i < 35; i++) {
    const isSunday = i % 7 === 6
    if (isSunday) {
      cells.push('Holiday')
      holidays++
      continue
    }
    const r = (seed * 9301 + (i + 1) * 49297) % 233280
    const p = r / 233280
    if (p < 0.08) {
      cells.push('Absent')
      absent++
    } else if (p < 0.12) {
      cells.push('Half Day')
      halfDay++
    } else {
      cells.push('Present')
      present++
    }
  }
  return { ym, cells, summary: { present, absent, halfDay, holidays } }
}

export function EmployeeDetailPage() {
  const { id } = useParams()
  const store = usePortalStore()
  const emp = store.employees.find((e) => e.id === id)
  const [tab, setTab] = useState<'attendance' | 'projects' | 'payroll'>('attendance')

  const [ym, setYm] = useState('2026-04')

  const avatar = useMemo(() => {
    const name = emp?.name ?? 'Employee'
    return (
      emp?.photoDataUrl ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
      )}&background=0F172A&color=F8FAFC&size=140&bold=true`
    )
  }, [emp?.name, emp?.photoDataUrl])

  const payrollRows: EmployeePayrollRow[] = useMemo(() => {
    // dummy last 6 months
    const base = [
      '2025-01',
      '2025-02',
      '2025-03',
      '2025-04',
      '2025-05',
      '2025-06',
    ]
    if (!emp) return []
    const monthlyBasic =
      emp.salaryType === 'Monthly' ? emp.salaryAmountRupees : emp.salaryAmountRupees * 26
    return base
      .map((m, idx) => {
        const overtime = 3200 - idx * 120
        const deductions = 6350 + idx * 80
        const net = Math.max(0, monthlyBasic + overtime - deductions)
        return {
          month: monthLabel(m),
          workingDays: 26 - (idx % 3),
          basicRupees: monthlyBasic,
          overtimeRupees: overtime,
          deductionsRupees: deductions,
          netPaidRupees: net,
          status: idx === 0 ? 'Paid' : idx === 1 ? 'Pending' : 'Paid',
        } as EmployeePayrollRow
      })
      .slice(0, 6)
  }, [emp])

  if (!emp) {
    return (
      <div className="space-y-4">
        <Link
          to="/portal/employees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Employees
        </Link>
        <EmptyState title="Employee not found" subtitle="This profile may have been removed." />
      </div>
    )
  }

  const empIdSuffix = emp.employeeId && emp.employeeId.includes('-')
    ? emp.employeeId.split('-')[1]
    : null
  const seedVal = empIdSuffix && !isNaN(Number(empIdSuffix)) ? Number(empIdSuffix) : 42

  const month = generateMonth(
    seedVal,
    ym,
  )

  const assigned = emp.assignedProjectId
    ? store.projects.find((p) => p.id === emp.assignedProjectId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/portal/employees"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Employees
          </Link>
          <div className="mt-2 font-heading text-2xl font-extrabold text-text">
            {emp.name}
          </div>
          <div className="mt-1 text-sm text-muted">
            {emp.role} • {emp.employeeId || 'N/A'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={toneForEmpStatus(emp.status)}>{emp.status}</Badge>
        </div>
      </div>

      <PortalCard>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={avatar} alt={emp.name} className="h-16 w-16 rounded-2xl border border-border object-cover" />
            <div>
              <div className="text-lg font-extrabold text-text">{emp.name}</div>
              <div className="mt-1 text-sm text-muted">{emp.role}</div>
              <div className="mt-1 text-xs font-semibold text-muted">{emp.employeeId || 'N/A'}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-muted">Phone</div>
              <div className="mt-1 text-sm font-extrabold text-text">{emp.phone}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-muted">Email</div>
              <div className="mt-1 text-sm font-extrabold text-text">{emp.email ?? '—'}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-muted">Assigned</div>
              <div className="mt-1 text-sm font-extrabold text-text">{assigned?.name ?? '—'}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'attendance', label: 'Attendance' },
              { id: 'projects', label: 'Projects' },
              { id: 'payroll', label: 'Payroll' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as any)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  tab === t.id
                    ? 'bg-orange-500 text-slate-950'
                    : 'border border-border bg-card hover:bg-slate-50 text-text/75 hover:bg-slate-100',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </PortalCard>

      {tab === 'attendance' && (
        <PortalCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-heading text-lg font-extrabold text-text">Attendance</div>
              <div className="text-xs font-semibold text-muted">Calendar view</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const [y, m] = ym.split('-').map(Number)
                  const d = new Date(y, (m ?? 1) - 2, 1)
                  setYm(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:bg-slate-50 text-text/75 hover:bg-slate-100"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="rounded-full border border-border bg-card hover:bg-slate-50 px-4 py-2 text-sm font-extrabold text-text">
                {monthLabel(ym)}
              </div>
              <button
                type="button"
                onClick={() => {
                  const [y, m] = ym.split('-').map(Number)
                  const d = new Date(y, (m ?? 1), 1)
                  setYm(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:bg-slate-50 text-text/75 hover:bg-slate-100"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center text-xs font-bold text-muted">
                {d}
              </div>
            ))}
            {month.cells.map((c, idx) => {
              const cls =
                c === 'Present'
                  ? 'bg-emerald-500/25 border-emerald-400/30'
                  : c === 'Absent'
                    ? 'bg-red-500/25 border-red-400/30'
                    : c === 'Half Day'
                      ? 'bg-yellow-500/25 border-yellow-400/30'
                      : 'bg-card hover:bg-slate-50 border-border'
              return (
                <div
                  key={idx}
                  className={`h-12 rounded-xl border ${cls} flex items-center justify-center text-xs font-extrabold text-secondary`}
                  title={c}
                >
                  {idx + 1}
                </div>
              )
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 p-4">
              <div className="text-xs font-semibold text-muted">Present</div>
              <div className="mt-1 text-lg font-extrabold text-emerald-700">{month.summary.present}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 p-4">
              <div className="text-xs font-semibold text-muted">Absent</div>
              <div className="mt-1 text-lg font-extrabold text-red-700">{month.summary.absent}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 p-4">
              <div className="text-xs font-semibold text-muted">Half Day</div>
              <div className="mt-1 text-lg font-extrabold text-yellow-200">{month.summary.halfDay}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card hover:bg-slate-50 p-4">
              <div className="text-xs font-semibold text-muted">Holidays</div>
              <div className="mt-1 text-lg font-extrabold text-text">{month.summary.holidays}</div>
            </div>
          </div>
        </PortalCard>
      )}

      {tab === 'projects' && (
        <PortalCard>
          <div className="font-heading text-lg font-extrabold text-text">Projects</div>
          <div className="mt-1 text-xs font-semibold text-muted">History (demo)</div>
          <div className="mt-4">
            <TableShell>
              <table className="w-full text-left text-sm">
                <thead className="bg-card hover:bg-slate-50 text-xs font-bold text-muted">
                  <tr>
                    <th className="px-5 py-3">Project name</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(assigned ? [assigned] : store.projects.slice(0, 2)).map((p) => (
                    <tr key={p.id} className="text-secondary">
                      <td className="px-5 py-4 font-extrabold text-text">{p.name}</td>
                      <td className="px-5 py-4">{emp.role}</td>
                      <td className="px-5 py-4">{p.startDate} → {p.deadline}</td>
                      <td className="px-5 py-4">
                        <Badge tone={p.status === 'Completed' ? 'green' : p.status === 'Delayed' ? 'red' : p.status === 'Ongoing' ? 'orange' : 'blue'}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>
        </PortalCard>
      )}

      {tab === 'payroll' && (
        <PortalCard>
          <div className="font-heading text-lg font-extrabold text-text">Payroll</div>
          <div className="mt-1 text-xs font-semibold text-muted">Last 6 months</div>
          <div className="mt-4">
            <TableShell>
              <table className="w-full text-left text-sm">
                <thead className="bg-card hover:bg-slate-50 text-xs font-bold text-muted">
                  <tr>
                    <th className="px-5 py-3">Month</th>
                    <th className="px-5 py-3">Working Days</th>
                    <th className="px-5 py-3">Basic</th>
                    <th className="px-5 py-3">Overtime</th>
                    <th className="px-5 py-3">Deductions</th>
                    <th className="px-5 py-3">Net Paid</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payrollRows.map((r, idx) => (
                    <tr key={idx} className="text-secondary">
                      <td className="px-5 py-4 font-extrabold text-text">{r.month}</td>
                      <td className="px-5 py-4">{r.workingDays}</td>
                      <td className="px-5 py-4">₹{r.basicRupees.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">₹{r.overtimeRupees.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">₹{r.deductionsRupees.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 font-extrabold text-emerald-700">₹{r.netPaidRupees.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <Badge tone={r.status === 'Paid' ? 'green' : r.status === 'Hold' ? 'red' : 'orange'}>{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>
        </PortalCard>
      )}
    </div>
  )
}

