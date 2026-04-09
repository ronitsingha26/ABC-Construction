import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, Receipt, Star } from 'lucide-react'
import { downloadTextFile } from '../../lib/download'
import { usePortalStore } from '../store'
import { usePortalToast } from '../toast'
import { EmptyState, Modal, PortalButton, PortalCard, TableShell } from '../ui'

function Stars({ value }: { value: number }) {
  const full = Math.round(Math.max(0, Math.min(5, value)))
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < full ? 'fill-orange-400 text-orange-400' : 'text-white/20'}`}
        />
      ))}
    </div>
  )
}

export function VendorDetailPage() {
  const { id } = useParams()
  const store = usePortalStore()
  const toast = usePortalToast()
  const vendor = store.vendors.find((v) => v.id === id)

  const [openReceipt, setOpenReceipt] = useState(false)

  const suppliedMaterials = useMemo(() => {
    if (!vendor) return []
    return store.materials.filter((m) => m.vendorId === vendor.id)
  }, [store.materials, vendor])

  const supplyHistory = useMemo(() => {
    if (!vendor) return []
    return suppliedMaterials.map((m) => {
      const project = m.projectId ? store.projects.find((p) => p.id === m.projectId)?.name : '—'
      const available = Math.max(0, m.total - m.used)
      return {
        material: m.name,
        category: m.category,
        unit: m.unit,
        total: m.total,
        used: m.used,
        available,
        project,
      }
    })
  }, [store.projects, suppliedMaterials, vendor])

  const paymentHistory = useMemo(() => {
    if (!vendor) return []
    return store.transactions
      .filter((t) => t.type === 'Expense' && t.category === 'Material')
      .slice(0, 10)
      .map((t) => ({
        date: t.date,
        desc: t.description,
        amount: t.amountRupees,
        status: t.status,
      }))
  }, [store.transactions, vendor])

  if (!vendor) {
    return (
      <div className="space-y-6">
        <PortalCard>
          <div className="font-heading text-2xl font-extrabold text-white">Vendor Profile</div>
          <div className="mt-1 text-sm text-white/60">Vendor not found.</div>
          <div className="mt-4">
            <Link to="/portal/vendors">
              <PortalButton variant="outline">Back to Vendors</PortalButton>
            </Link>
          </div>
        </PortalCard>
        <EmptyState title="No vendor data" subtitle="This vendor ID does not exist in the store." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-semibold text-white/55">Vendor Profile</div>
          <div className="mt-1 font-heading text-2xl font-extrabold text-white">{vendor.name}</div>
          <div className="mt-2 text-sm text-white/65">{vendor.category}</div>
          <div className="mt-2 text-sm text-white/75">
            {vendor.contactPerson ?? '—'} • {vendor.phone}
          </div>
          <div className="mt-1 text-sm text-white/55">{vendor.city}</div>
          <div className="mt-3 flex items-center gap-2">
            <Stars value={vendor.rating ?? 4} />
            <div className="text-xs font-semibold text-white/55">{(vendor.rating ?? 4).toFixed(1)} / 5</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/portal/vendors">
            <PortalButton variant="outline">Back</PortalButton>
          </Link>
          <PortalButton variant="outline" onClick={() => setOpenReceipt(true)}>
            <Receipt className="h-4 w-4" /> View Receipt (Demo)
          </PortalButton>
        </div>
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Materials Supplied</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-white">{suppliedMaterials.length}</div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Orders</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-white">
            {Math.max(0, Math.round((vendor.rating ?? 4) * 6))}
          </div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Pending Payment</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-orange-200">
            ₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(vendor.pendingPaymentRupees ?? 0)}
          </div>
        </PortalCard>
      </div>

      <PortalCard>
        <div className="font-heading text-lg font-extrabold text-white">Supply History</div>
        <div className="mt-1 text-xs font-semibold text-white/55">Materials mapped to this vendor</div>
        <div className="mt-5">
          {supplyHistory.length === 0 ? (
            <EmptyState title="No materials" subtitle="No materials are linked to this vendor yet." />
          ) : (
            <TableShell>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs font-bold text-white/60">
                  <tr>
                    <th className="px-5 py-3">Material</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Used</th>
                    <th className="px-5 py-3">Available</th>
                    <th className="px-5 py-3">Project</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {supplyHistory.map((r) => (
                    <tr key={r.material} className="text-white/80">
                      <td className="px-5 py-4 font-semibold text-white">{r.material}</td>
                      <td className="px-5 py-4">{r.category}</td>
                      <td className="px-5 py-4">{r.total}</td>
                      <td className="px-5 py-4">{r.used}</td>
                      <td className="px-5 py-4 font-extrabold text-white">{r.available}</td>
                      <td className="px-5 py-4">{r.project}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </div>
      </PortalCard>

      <PortalCard>
        <div className="font-heading text-lg font-extrabold text-white">Payment History</div>
        <div className="mt-1 text-xs font-semibold text-white/55">Latest 10 expense entries (demo)</div>
        <div className="mt-5">
          {paymentHistory.length === 0 ? (
            <EmptyState title="No payments" subtitle="No payment entries found." />
          ) : (
            <TableShell>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs font-bold text-white/60">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paymentHistory.map((p, idx) => (
                    <tr key={`${p.date}-${idx}`} className="text-white/80">
                      <td className="px-5 py-4">{p.date}</td>
                      <td className="px-5 py-4 font-semibold text-white">{p.desc}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            'rounded-full px-3 py-1 text-xs font-bold',
                            p.status === 'Cleared' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-orange-500/15 text-orange-200',
                          ].join(' ')}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-white">
                        ₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </div>
      </PortalCard>

      <PortalCard>
        <div className="font-heading text-lg font-extrabold text-white">Materials Supplied</div>
        <div className="mt-1 text-xs font-semibold text-white/55">Current mapped materials list</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {suppliedMaterials.length === 0 ? (
            <span className="text-sm text-white/55">—</span>
          ) : (
            suppliedMaterials.map((m) => (
              <span
                key={m.id}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70"
              >
                {m.name}
              </span>
            ))
          )}
        </div>
      </PortalCard>

      <Modal
        open={openReceipt}
        title="Receipt (Demo)"
        onClose={() => setOpenReceipt(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenReceipt(false)}>
              Close
            </PortalButton>
            <PortalButton
              onClick={() => {
                if (!vendor) return
                downloadTextFile(
                  `vendor-receipt-${vendor.id}.txt`,
                  [
                    'ABC CONSTRUCTION — Vendor receipt (demo)',
                    `Vendor: ${vendor.name}`,
                    `Contact: ${vendor.contactPerson ?? '—'} — ${vendor.phone}`,
                    `City: ${vendor.city}`,
                    `Pending payment: ₹${new Intl.NumberFormat('en-IN').format(vendor.pendingPaymentRupees ?? 0)}`,
                  ].join('\n'),
                  'text/plain;charset=utf-8',
                )
                toast.push({ tone: 'success', title: 'Receipt downloaded' })
              }}
            >
              <Download className="h-4 w-4" /> Download
            </PortalButton>
          </div>
        }
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          This is a placeholder for receipt attachments (PDF/images). Next phase can add uploads and per-transaction links.
        </div>
      </Modal>
    </div>
  )
}

