import { useMemo, useState } from 'react'
import { Download, Eye, FileText, Plus, Receipt } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { downloadTextFile } from '../../lib/download'
import { usePortalStore, type FinanceTransaction, type Invoice } from '../store'
import { Badge, EmptyState, Input, Modal, PortalButton, PortalCard, Select, TableShell } from '../ui'
import { usePortalSearch } from '../search'
import { usePortalToast } from '../toast'

function toneForInvoice(s: Invoice['status']) {
  if (s === 'Paid') return 'green'
  if (s === 'Pending') return 'orange'
  return 'red'
}

function toneForTxType(t: FinanceTransaction['type']) {
  if (t === 'Income') return 'green'
  if (t === 'Expense') return 'red'
  return 'blue'
}

function inr(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}

function inrShort(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)} Cr`
  if (abs >= 1_00_000) return `${(n / 1_00_000).toFixed(1)} L`
  return `₹${inr(n)}`
}

function exportInvoiceCsv(inv: Invoice, clientName: string, projectName: string) {
  const subtotal = inv.lineItems.reduce((a, b) => a + b.qty * b.rateRupees, 0)
  const gst = Math.round(subtotal * 0.18)
  const grand = subtotal + gst
  const lines = [
    'Field,Value',
    `Invoice,"${inv.id}"`,
    `Client,"${clientName}"`,
    `Project,"${projectName}"`,
    `Issued,"${inv.issuedDate}"`,
    `Due,"${inv.dueDate}"`,
    `Status,"${inv.status}"`,
    '',
    'Description,Qty,Rate,Amount',
    ...inv.lineItems.map(
      (li) =>
        `"${li.description.replace(/"/g, '""')}",${li.qty},${li.rateRupees},${li.qty * li.rateRupees}`,
    ),
    '',
    `Subtotal,,,${subtotal}`,
    `GST 18%,,,${gst}`,
    `Grand Total,,,${grand}`,
  ]
  const safe = inv.id.replace(/[^a-zA-Z0-9-_]/g, '_')
  downloadTextFile(`invoice-${safe}.csv`, lines.join('\n'), 'text/csv;charset=utf-8')
}

function exportTransactionReceipt(t: FinanceTransaction) {
  const body = [
    'ABC CONSTRUCTION — Transaction receipt',
    '',
    `Reference: ${t.id}`,
    `Date: ${t.date}`,
    `Type: ${t.type}`,
    `Category: ${t.category}`,
    `Status: ${t.status}`,
    '',
    t.description,
    '',
    `Amount: ₹${inr(t.amountRupees)}`,
  ].join('\n')
  downloadTextFile(`receipt-${t.id}.txt`, body, 'text/plain;charset=utf-8')
}

export function FinancePage() {
  const { invoices, clients, projects, transactions, addTransaction } = usePortalStore()
  const global = usePortalSearch()
  const toast = usePortalToast()
  const [tab, setTab] = useState<'transactions' | 'invoices' | 'expenses'>('transactions')
  const [openTx, setOpenTx] = useState(false)
  const [txDate, setTxDate] = useState('2026-04-08')
  const [txDesc, setTxDesc] = useState('')
  const [txType, setTxType] = useState<FinanceTransaction['type']>('Expense')
  const [txAmt, setTxAmt] = useState('0')
  const [txProjectId, setTxProjectId] = useState(projects[0]?.id ?? '')
  const [txCategory, setTxCategory] = useState<FinanceTransaction['category']>('Material')
  const [txStatus, setTxStatus] = useState<FinanceTransaction['status']>('Pending')

  const [openInv, setOpenInv] = useState(false)
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>('')

  const top = useMemo(() => {
    // per prompt: show the requested totals
    return {
      revenue: '₹4.8 Cr',
      expenses: '₹3.1 Cr',
      profit: '₹1.7 Cr',
      outstanding: '₹68 Lakh',
    }
  }, [])

  const filteredTx = useMemo(() => {
    const needle = global.query.trim().toLowerCase()
    if (!needle) return transactions
    return transactions.filter((t) => {
      const p = t.projectId ? projects.find((x) => x.id === t.projectId)?.name ?? '' : ''
      return (
        t.description.toLowerCase().includes(needle) ||
        t.type.toLowerCase().includes(needle) ||
        t.category.toLowerCase().includes(needle) ||
        t.status.toLowerCase().includes(needle) ||
        p.toLowerCase().includes(needle)
      )
    })
  }, [global.query, projects, transactions])

  const filteredInv = useMemo(() => {
    const needle = global.query.trim().toLowerCase()
    if (!needle) return invoices
    return invoices.filter((i) => {
      const c = clients.find((x) => x.id === i.clientId)?.name ?? ''
      const p = projects.find((x) => x.id === i.projectId)?.name ?? ''
      return (
        i.id.toLowerCase().includes(needle) ||
        c.toLowerCase().includes(needle) ||
        p.toLowerCase().includes(needle) ||
        i.status.toLowerCase().includes(needle)
      )
    })
  }, [clients, global.query, invoices, projects])

  const activeInvoice = useMemo(() => {
    return invoices.find((i) => i.id === activeInvoiceId) ?? null
  }, [activeInvoiceId, invoices])

  const saveTx = () => {
    const amt = Math.max(0, Number(txAmt) || 0)
    if (!txDesc.trim() || amt <= 0) return
    addTransaction({
      date: txDate,
      description: txDesc.trim(),
      type: txType,
      amountRupees: amt,
      projectId: txProjectId || undefined,
      category: txCategory,
      status: txStatus,
    })
    toast.push({ tone: 'success', title: 'Transaction added' })
    setOpenTx(false)
    setTxDesc('')
    setTxAmt('0')
  }

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-2xl font-extrabold text-white">Finance</div>
          <div className="mt-1 text-sm text-white/60">
            Revenue, expenses, invoices, and operational cashflow.
          </div>
        </div>
        <PortalButton onClick={() => setOpenTx(true)}>
          <Plus className="h-4 w-4" /> Add Transaction
        </PortalButton>
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-4">
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Total Revenue</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-emerald-200">
            {top.revenue}
          </div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Total Expenses</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-red-200">{top.expenses}</div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Net Profit</div>
          <div className="mt-2 font-heading text-4xl font-extrabold text-emerald-200">{top.profit}</div>
          <div className="mt-1 text-xs font-semibold text-white/45">This FY (demo)</div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Outstanding</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-orange-200">
            {top.outstanding}
          </div>
        </PortalCard>
      </div>

      <PortalCard>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('transactions')}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              tab === 'transactions'
                ? 'bg-orange-500 text-slate-950'
                : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
            ].join(' ')}
          >
            Transactions
          </button>
          <button
            type="button"
            onClick={() => setTab('invoices')}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              tab === 'invoices'
                ? 'bg-orange-500 text-slate-950'
                : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
            ].join(' ')}
          >
            Invoices
          </button>
          <button
            type="button"
            onClick={() => setTab('expenses')}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              tab === 'expenses'
                ? 'bg-orange-500 text-slate-950'
                : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
            ].join(' ')}
          >
            Expenses
          </button>
        </div>
      </PortalCard>

      {tab === 'transactions' && (
        <TableShell>
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs font-bold text-white/60">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount (₹)</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTx.map((t) => {
                const p = t.projectId ? projects.find((x) => x.id === t.projectId) : undefined
                return (
                  <tr key={t.id} className="text-white/80">
                    <td className="px-5 py-4">{t.date}</td>
                    <td className="px-5 py-4 font-semibold text-white">{t.description}</td>
                    <td className="px-5 py-4">
                      <Badge tone={toneForTxType(t.type)}>{t.type}</Badge>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-white">₹{inr(t.amountRupees)}</td>
                    <td className="px-5 py-4">{p?.name ?? '—'}</td>
                    <td className="px-5 py-4">{t.category}</td>
                    <td className="px-5 py-4">
                      <Badge tone={t.status === 'Cleared' ? 'green' : 'orange'}>{t.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <PortalButton
                        variant="ghost"
                        aria-label="Download receipt"
                        onClick={() => {
                          exportTransactionReceipt(t)
                          toast.push({ tone: 'success', title: 'Receipt downloaded' })
                        }}
                      >
                        <Receipt className="h-4 w-4" />
                      </PortalButton>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableShell>
      )}

      {tab === 'invoices' && (
        filteredInv.length === 0 ? (
          <EmptyState title="No invoices" subtitle="Add invoices to track receivables." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {filteredInv.map((i) => {
              const c = clients.find((x) => x.id === i.clientId)
              const p = projects.find((x) => x.id === i.projectId)
              const tone = toneForInvoice(i.status)
              const stamp =
                i.status === 'Paid'
                  ? 'PAID'
                  : i.status === 'Overdue'
                    ? 'OVERDUE'
                    : 'PENDING'
              const stampBg =
                i.status === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                  : i.status === 'Overdue'
                    ? 'bg-red-500/20 text-red-200 border-red-400/30'
                    : 'bg-orange-500/20 text-orange-200 border-orange-400/30'

              return (
                <PortalCard key={i.id} className="relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-white/60" />
                        <div className="font-heading text-lg font-extrabold text-white">{i.id}</div>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white/70">{c?.name ?? '—'}</div>
                      <div className="mt-1 text-xs font-semibold text-white/45">{p?.name ?? '—'}</div>
                    </div>
                    <div className={`rotate-12 rounded-xl border px-3 py-2 text-xs font-extrabold ${stampBg}`}>
                      {stamp}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs font-semibold text-white/55">Amount</div>
                      <div className="mt-1 font-extrabold text-white">{inrShort(i.amountRupees)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs font-semibold text-white/55">Due Date</div>
                      <div className="mt-1 font-extrabold text-white">{i.dueDate}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge tone={tone}>{i.status}</Badge>
                    <div className="flex items-center gap-2">
                      <PortalButton
                        variant="outline"
                        onClick={() => {
                          setActiveInvoiceId(i.id)
                          setOpenInv(true)
                        }}
                      >
                        <Eye className="h-4 w-4" /> View
                      </PortalButton>
                      <PortalButton
                        variant="ghost"
                        onClick={() => {
                          exportInvoiceCsv(i, c?.name ?? '—', p?.name ?? '—')
                          toast.push({ tone: 'success', title: 'Invoice exported (CSV)' })
                        }}
                      >
                        <Download className="h-4 w-4" /> Download
                      </PortalButton>
                    </div>
                  </div>
                </PortalCard>
              )
            })}
          </div>
        )
      )}

      {tab === 'expenses' && (
        <PortalCard>
          <div className="font-heading text-lg font-extrabold text-white">Expenses by Category</div>
          <div className="mt-1 text-sm text-white/55">Demo chart (from transactions)</div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  'Labor',
                  'Material',
                  'Equipment',
                  'Transport',
                  'Overhead',
                  'Miscellaneous',
                ].map((cat) => {
                  const total = transactions
                    .filter((t) => t.type === 'Expense' && t.category === cat)
                    .reduce((a, b) => a + b.amountRupees, 0)
                  return { cat, total }
                })}
              >
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
                  formatter={(v) => [`₹${inr(Number(v))}`, 'Amount']}
                />
                <Bar dataKey="total" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <TableShell>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs font-bold text-white/60">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transactions
                    .filter((t) => t.type === 'Expense')
                    .slice(0, 20)
                    .map((t) => {
                      const p = t.projectId ? projects.find((x) => x.id === t.projectId) : undefined
                      return (
                        <tr key={t.id} className="text-white/80">
                          <td className="px-5 py-4">{t.date}</td>
                          <td className="px-5 py-4 font-semibold text-white">{t.description}</td>
                          <td className="px-5 py-4">{t.category}</td>
                          <td className="px-5 py-4">{p?.name ?? '—'}</td>
                          <td className="px-5 py-4 text-right font-extrabold text-white">
                            ₹{inr(t.amountRupees)}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </TableShell>
          </div>
        </PortalCard>
      )}

      <Modal
        open={openTx}
        title="Add Transaction"
        onClose={() => setOpenTx(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenTx(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={saveTx} disabled={!txDesc.trim() || Number(txAmt) <= 0}>
              Save
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Type"
            value={txType}
            onChange={(v) => setTxType(v as FinanceTransaction['type'])}
            options={[
              { label: 'Income', value: 'Income' },
              { label: 'Expense', value: 'Expense' },
              { label: 'Advance', value: 'Advance' },
            ]}
          />
          <Input label="Date" value={txDate} onChange={setTxDate} type="date" />
          <Input label="Description" value={txDesc} onChange={setTxDesc} />
          <Input label="Amount (₹)" value={txAmt} onChange={setTxAmt} type="number" />
          <Select
            label="Project"
            value={txProjectId}
            onChange={setTxProjectId}
            options={[{ label: '—', value: '' }, ...projects.map((p) => ({ label: p.name, value: p.id }))]}
          />
          <Select
            label="Category"
            value={txCategory}
            onChange={(v) => setTxCategory(v as FinanceTransaction['category'])}
            options={[
              { label: 'Labor', value: 'Labor' },
              { label: 'Material', value: 'Material' },
              { label: 'Equipment', value: 'Equipment' },
              { label: 'Transport', value: 'Transport' },
              { label: 'Overhead', value: 'Overhead' },
              { label: 'Miscellaneous', value: 'Miscellaneous' },
            ]}
          />
          <Select
            label="Status"
            value={txStatus}
            onChange={(v) => setTxStatus(v as FinanceTransaction['status'])}
            options={[
              { label: 'Pending', value: 'Pending' },
              { label: 'Cleared', value: 'Cleared' },
            ]}
          />
        </div>
      </Modal>

      <Modal
        open={openInv}
        title="Invoice"
        onClose={() => setOpenInv(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenInv(false)}>
              Close
            </PortalButton>
            <PortalButton
              onClick={() => {
                if (!activeInvoice) {
                  toast.push({ tone: 'warning', title: 'Open an invoice first' })
                  return
                }
                const c = clients.find((x) => x.id === activeInvoice.clientId)
                const p = projects.find((x) => x.id === activeInvoice.projectId)
                exportInvoiceCsv(activeInvoice, c?.name ?? '—', p?.name ?? '—')
                toast.push({ tone: 'success', title: 'Invoice downloaded' })
              }}
            >
              <Download className="h-4 w-4" /> Download
            </PortalButton>
          </div>
        }
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="font-heading text-xl font-extrabold text-white">ABC CONSTRUCTION</div>
              <div className="mt-1 text-sm text-white/60">Professional Invoice</div>
              <div className="mt-3 text-xs font-semibold text-white/55">
                123 Builder Street, Patna, Bihar — 800001
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm">
              <div className="text-xs font-semibold text-white/55">GST</div>
              <div className="font-extrabold text-white">18%</div>
              <div className="mt-2 text-xs font-semibold text-white/55">Bank</div>
              <div className="font-semibold text-white/80">ABC Bank • A/C XXXX1234</div>
              <div className="text-xs font-semibold text-white/55">IFSC: ABCD0000123</div>
            </div>
          </div>

          {activeInvoice ? (
            (() => {
              const c = clients.find((x) => x.id === activeInvoice.clientId)
              const p = projects.find((x) => x.id === activeInvoice.projectId)
              const subtotal = activeInvoice.lineItems.reduce((a, b) => a + b.qty * b.rateRupees, 0)
              const gst = Math.round(subtotal * 0.18)
              const grand = subtotal + gst
              const stamp =
                activeInvoice.status === 'Paid'
                  ? 'PAID'
                  : activeInvoice.status === 'Overdue'
                    ? 'OVERDUE'
                    : 'PENDING'
              const stampBg =
                activeInvoice.status === 'Paid'
                  ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
                  : activeInvoice.status === 'Overdue'
                    ? 'bg-red-500/15 text-red-200 border-red-400/30'
                    : 'bg-orange-500/15 text-orange-200 border-orange-400/30'

              return (
                <div className="mt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="text-sm text-white/75">
                      <div className="text-xs font-semibold text-white/55">Invoice</div>
                      <div className="mt-1 font-heading text-2xl font-extrabold text-white">
                        {activeInvoice.id}
                      </div>
                      <div className="mt-3 grid gap-1">
                        <div>
                          <span className="text-xs font-semibold text-white/55">Client:</span>{' '}
                          <span className="font-semibold text-white">{c?.name ?? '—'}</span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white/55">Project:</span>{' '}
                          <span className="font-semibold text-white">{p?.name ?? '—'}</span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white/55">Issued:</span>{' '}
                          <span className="font-semibold text-white">{activeInvoice.issuedDate}</span>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-white/55">Due:</span>{' '}
                          <span className="font-semibold text-white">{activeInvoice.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`rotate-6 rounded-2xl border px-5 py-4 text-sm font-extrabold ${stampBg}`}>
                      {stamp}
                    </div>
                  </div>

                  <div className="mt-6">
                    <TableShell>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-xs font-bold text-white/60">
                          <tr>
                            <th className="px-5 py-3">Description</th>
                            <th className="px-5 py-3">Qty</th>
                            <th className="px-5 py-3">Rate</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {activeInvoice.lineItems.map((li, idx) => (
                            <tr key={idx} className="text-white/80">
                              <td className="px-5 py-4 font-semibold text-white">{li.description}</td>
                              <td className="px-5 py-4">{li.qty}</td>
                              <td className="px-5 py-4">₹{inr(li.rateRupees)}</td>
                              <td className="px-5 py-4 text-right font-extrabold text-white">
                                ₹{inr(li.qty * li.rateRupees)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableShell>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="text-xs font-semibold text-white/55">Subtotal</div>
                      <div className="mt-1 font-extrabold text-white">₹{inr(subtotal)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="text-xs font-semibold text-white/55">GST (18%)</div>
                      <div className="mt-1 font-extrabold text-white">₹{inr(gst)}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="text-xs font-semibold text-white/55">Grand Total</div>
                      <div className="mt-1 font-heading text-2xl font-extrabold text-white">
                        ₹{inr(grand)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()
          ) : (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Select an invoice card and click “View”.
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

