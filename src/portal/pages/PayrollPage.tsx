import { useMemo, useState } from 'react'
import { Download, MessageCircle, Receipt, Sparkles } from 'lucide-react'
import { printHtmlDocument } from '../../lib/download'
import { usePortalStore, type PayrollStatus } from '../store'
import { Badge, Modal, PortalButton, PortalCard, Select, TableShell } from '../ui'
import { usePortalToast } from '../toast'

function tone(status: PayrollStatus) {
  if (status === 'Paid') return 'green'
  if (status === 'Hold') return 'red'
  return 'orange'
}

function inr(n: number) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n))
}

const monthOptions = [
  { label: 'June 2025', value: 'June 2025' },
  { label: 'May 2025', value: 'May 2025' },
  { label: 'April 2025', value: 'April 2025' },
] as const

export function PayrollPage() {
  const store = usePortalStore()
  const toast = usePortalToast()
  const [month, setMonth] = useState<(typeof monthOptions)[number]['value']>('June 2025')
  const [openPayslip, setOpenPayslip] = useState(false)
  const [activeEmpId, setActiveEmpId] = useState<string>('')

  const rows = useMemo(() => {
    return store.employees.slice(0, 45).map((e, idx) => {
      const days = 26 - (idx % 4)
      const basic = e.salaryType === 'Monthly' ? e.salaryAmountRupees : e.salaryAmountRupees * days
      const overtime = 3200 - (idx % 5) * 200
      const deductions = 6350 + (idx % 3) * 150
      const net = Math.max(0, basic + overtime - deductions)
      const status: PayrollStatus = idx % 7 === 0 ? 'Hold' : idx % 5 === 0 ? 'Pending' : 'Paid'
      return { e, days, basic, overtime, deductions, net, status }
    })
  }, [store.employees])

  const paidCount = rows.filter((r) => r.status === 'Paid').length
  const totalCount = 45
  const totalPayrollLakh = 14.2
  const pendingLakh = 2.1

  const progressPct = Math.round((paidCount / totalCount) * 100)

  const active = useMemo(() => rows.find((r) => r.e.id === activeEmpId) ?? null, [activeEmpId, rows])

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-2xl font-extrabold text-white">Payroll</div>
          <div className="mt-1 text-sm text-white/60">
            Monthly payroll generation, payment status, and payslips.
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Select label="Month" value={month} onChange={(v) => setMonth(v as any)} options={monthOptions as any} />
          <PortalButton
            onClick={() =>
              toast.push({ tone: 'success', title: 'Payroll run queued (demo)', message: `Month: ${month}` })
            }
          >
            <Sparkles className="h-4 w-4" />
            Generate Payroll
          </PortalButton>
        </div>
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Total Payroll This Month</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-white">
            ₹{totalPayrollLakh} Lakh
          </div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Employees Paid</div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="font-heading text-3xl font-extrabold text-white">
              {paidCount}/{totalCount}
            </div>
            <div className="text-xs font-semibold text-white/55">{progressPct}%</div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progressPct}%` }} />
          </div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Pending</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-red-200">
            ₹{pendingLakh} Lakh
          </div>
        </PortalCard>
      </div>

      <TableShell>
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs font-bold text-white/60">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Days</th>
              <th className="px-5 py-3">Basic (₹)</th>
              <th className="px-5 py-3">Overtime (₹)</th>
              <th className="px-5 py-3">Deductions (₹)</th>
              <th className="px-5 py-3">Net (₹)</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Payslip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((r) => (
              <tr key={r.e.id} className="text-white/80">
                <td className="px-5 py-4">
                  <div className="font-extrabold text-white">{r.e.name}</div>
                  <div className="mt-1 text-xs font-semibold text-white/45">{r.e.employeeId}</div>
                </td>
                <td className="px-5 py-4">{r.e.role}</td>
                <td className="px-5 py-4">{r.days}</td>
                <td className="px-5 py-4">₹{inr(r.basic)}</td>
                <td className="px-5 py-4">₹{inr(r.overtime)}</td>
                <td className="px-5 py-4">₹{inr(r.deductions)}</td>
                <td className="px-5 py-4 font-extrabold text-emerald-200">₹{inr(r.net)}</td>
                <td className="px-5 py-4">
                  <Badge tone={tone(r.status)}>{r.status}</Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEmpId(r.e.id)
                      setOpenPayslip(true)
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                    aria-label="Payslip"
                  >
                    <Receipt className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <Modal
        open={openPayslip}
        title="Payslip"
        onClose={() => setOpenPayslip(false)}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <PortalButton
              variant="outline"
              onClick={() => {
                if (!active) return
                const body = `
                  <h2>ABC CONSTRUCTION</h2>
                  <p><strong>Payslip — ${month}</strong></p>
                  <table>
                    <tr><th>Employee</th><td>${active.e.name}</td></tr>
                    <tr><th>Employee ID</th><td>${active.e.employeeId}</td></tr>
                    <tr><th>Role</th><td>${active.e.role}</td></tr>
                    <tr><th>Working days</th><td>${active.days}</td></tr>
                    <tr><th>Basic</th><td>₹${inr(active.basic)}</td></tr>
                    <tr><th>Overtime</th><td>₹${inr(active.overtime)}</td></tr>
                    <tr><th>Deductions</th><td>₹${inr(active.deductions)}</td></tr>
                    <tr><th>Net pay</th><td>₹${inr(active.net)}</td></tr>
                    <tr><th>Status</th><td>${active.status}</td></tr>
                  </table>`
                const ok = printHtmlDocument(`Payslip-${active.e.employeeId}`, body)
                toast.push({
                  tone: ok ? 'success' : 'error',
                  title: ok ? 'Print / save as PDF from the dialog' : 'Allow pop-ups to print payslip',
                })
              }}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </PortalButton>
            <PortalButton
              onClick={() => {
                if (!active) return
                const text = encodeURIComponent(
                  `Payslip ${month} — ${active.e.name} (${active.e.employeeId}). Net: ₹${inr(active.net)}. — ABC Construction`,
                )
                window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
                toast.push({ tone: 'info', title: 'WhatsApp opened' })
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Send on WhatsApp
            </PortalButton>
          </div>
        }
      >
        {!active ? (
          <div className="text-sm text-white/60">Select an employee.</div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 font-mono text-sm text-white/85">
            <div className="flex items-center justify-between">
              <div className="font-extrabold">ABC CONSTRUCTION</div>
              <div className="text-white/60">Payslip — {month}</div>
            </div>
            <div className="my-4 h-px bg-white/10" />
            <div className="grid grid-cols-2 gap-2">
              <div className="text-white/60">Employee</div>
              <div className="font-semibold">{active.e.name}</div>
              <div className="text-white/60">Employee ID</div>
              <div className="font-semibold">{active.e.employeeId}</div>
              <div className="text-white/60">Role</div>
              <div className="font-semibold">{active.e.role}</div>
              <div className="text-white/60">Month</div>
              <div className="font-semibold">{month}</div>
            </div>
            <div className="my-4 h-px bg-white/10" />
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-extrabold text-white/70">EARNINGS</div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between"><span>Basic</span><span>₹{inr(active.basic)}</span></div>
                  <div className="flex items-center justify-between"><span>HRA</span><span>₹{inr(8000)}</span></div>
                  <div className="flex items-center justify-between"><span>Overtime</span><span>₹{inr(active.overtime)}</span></div>
                </div>
              </div>
              <div>
                <div className="text-xs font-extrabold text-white/70">DEDUCTIONS</div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between"><span>PF</span><span>₹{inr(4200)}</span></div>
                  <div className="flex items-center justify-between"><span>ESI</span><span>₹{inr(650)}</span></div>
                  <div className="flex items-center justify-between"><span>TDS</span><span>₹{inr(1500)}</span></div>
                </div>
              </div>
            </div>
            <div className="my-4 h-px bg-white/10" />
            <div className="flex items-center justify-between text-base font-extrabold">
              <div>NET SALARY:</div>
              <div>₹{inr(active.net)}</div>
            </div>
            <div className="mt-3 text-sm font-semibold">
              Status: {active.status === 'Paid' ? '✅ PAID' : active.status === 'Pending' ? '🟠 PENDING' : '🔴 HOLD'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

