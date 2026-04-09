import { useMemo, useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import { usePortalStore, type InventoryRequestStatus, type Material } from '../store'
import { Badge, EmptyState, Input, Modal, PortalButton, PortalCard, Select, TableShell } from '../ui'
import { usePortalSearch } from '../search'
import { usePortalToast } from '../toast'

export function InventoryPage() {
  const {
    materials,
    vendors,
    projects,
    employees,
    inventoryRequests,
    addMaterial,
    updateMaterial,
    updateInventoryRequest,
  } = usePortalStore()
  const global = usePortalSearch()
  const toast = usePortalToast()
  const [tab, setTab] = useState<'stock' | 'requests'>('stock')

  const [openAdd, setOpenAdd] = useState(false)
  const [matName, setMatName] = useState('')
  const [category, setCategory] = useState<Material['category']>('Cement')
  const [unit, setUnit] = useState('Bags')
  const [opening, setOpening] = useState('0')
  const [vendorId, setVendorId] = useState(vendors[0]?.id ?? '')
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')

  const [openEdit, setOpenEdit] = useState(false)
  const [editId, setEditId] = useState('')
  const [editTotal, setEditTotal] = useState('')
  const [editUsed, setEditUsed] = useState('')
  const [editMin, setEditMin] = useState('')

  const filteredMaterials = useMemo(() => {
    const needle = global.query.trim().toLowerCase()
    return (needle ? materials.filter((m) => m.name.toLowerCase().includes(needle)) : materials).map(
      (m) => {
        const available = Math.max(0, m.total - m.used)
        const pct = Math.round((available / Math.max(1, m.total)) * 100)
        return { ...m, available, pct }
      },
    )
  }, [global.query, materials])

  const totals = useMemo(() => {
    // per prompt: show the requested numbers (enterprise dashboards often show totals from ERP)
    return { totalMaterials: 48, lowStock: 6, pendingRequests: 4, totalValueLakh: 38.4 }
  }, [])

  const categoryChips: Material['category'][] = [
    'Cement',
    'Steel',
    'Sand',
    'Bricks',
    'Paint',
    'Electricals',
    'Plumbing',
    'Other',
  ]

  const projectOptions = projects.map((p) => ({ label: p.name, value: p.id }))
  const vendorOptions = vendors.map((v) => ({ label: v.name, value: v.id }))

  const add = () => {
    const total = Math.max(0, Number(opening) || 0)
    if (!matName.trim() || !unit.trim() || !vendorId) return
    addMaterial({
      name: matName.trim(),
      category,
      unit: unit.trim(),
      total,
      used: 0,
      minStock: Math.max(1, Math.round(total * 0.3)),
      vendorId,
      projectId: projectId || undefined,
      unitPriceRupees: 0,
    })
    toast.push({ tone: 'success', title: 'Material added' })
    setOpenAdd(false)
    setMatName('')
    setOpening('0')
  }

  const requestRows = useMemo(() => {
    return (inventoryRequests ?? []).map((r) => {
      const by = employees.find((e) => e.id === r.requestedByEmployeeId)
      const proj = projects.find((p) => p.id === r.projectId)
      const mat = materials.find((m) => m.id === r.materialId)
      return { r, by, proj, mat }
    })
  }, [employees, inventoryRequests, materials, projects])

  const reqTone = (s: InventoryRequestStatus) =>
    s === 'Approved' ? 'green' : s === 'Rejected' ? 'red' : 'orange'

  const openEditMaterial = (m: Material) => {
    setEditId(m.id)
    setEditTotal(String(m.total))
    setEditUsed(String(m.used))
    setEditMin(String(m.minStock))
    setOpenEdit(true)
  }

  const saveEditMaterial = () => {
    if (!editId) return
    const total = Math.max(0, Number(editTotal) || 0)
    const used = Math.max(0, Math.min(total, Number(editUsed) || 0))
    const minStock = Math.max(0, Number(editMin) || 0)
    updateMaterial(editId, { total, used, minStock })
    toast.push({ tone: 'success', title: 'Material updated' })
    setOpenEdit(false)
  }

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-2xl font-extrabold text-white">Inventory</div>
          <div className="mt-1 text-sm text-white/60">
            Stock visibility, requests, and low-stock controls.
          </div>
        </div>
        <PortalButton onClick={() => setOpenAdd(true)}>
          <Plus className="h-4 w-4" /> Add Material
        </PortalButton>
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-4">
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Total Materials</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-white">
            {totals.totalMaterials} types
          </div>
        </PortalCard>
        <PortalCard>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white/60">Low Stock</div>
            <AlertTriangle className="h-5 w-5 text-red-300" />
          </div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-red-200">
            {totals.lowStock} items
          </div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Pending Requests</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-orange-200">
            {totals.pendingRequests}
          </div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Total Value</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-white">
            ₹{totals.totalValueLakh} Lakh
          </div>
        </PortalCard>
      </div>

      <PortalCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('stock')}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                tab === 'stock'
                  ? 'bg-orange-500 text-slate-950'
                  : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
              ].join(' ')}
            >
              Stock
            </button>
            <button
              type="button"
              onClick={() => setTab('requests')}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                tab === 'requests'
                  ? 'bg-orange-500 text-slate-950'
                  : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
              ].join(' ')}
            >
              Requests
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryChips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </PortalCard>

      {tab === 'stock' && (
        materials.length === 0 ? (
          <EmptyState title="No materials" subtitle="Add materials to start tracking stock." />
        ) : (
          <TableShell>
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs font-bold text-white/60">
                <tr>
                  <th className="px-5 py-3">Material Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Unit</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Used</th>
                  <th className="px-5 py-3">Available</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Stock Level</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredMaterials.map((m) => {
                  const available = Math.max(0, m.total - m.used)
                  const pct = Math.round((available / Math.max(1, m.total)) * 100)
                  const bar =
                    pct > 60 ? 'bg-emerald-400' : pct >= 30 ? 'bg-orange-400' : 'bg-red-400'
                  const low = pct < 30
                  const proj = m.projectId ? projects.find((p) => p.id === m.projectId)?.name : '—'
                  return (
                    <tr key={m.id} className="text-white/80">
                      <td className="px-5 py-4 font-extrabold text-white">{m.name}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/75">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">{m.unit}</td>
                      <td className="px-5 py-4">{m.total}</td>
                      <td className="px-5 py-4">{m.used}</td>
                      <td className="px-5 py-4 font-extrabold text-white">{available}</td>
                      <td className="px-5 py-4">{proj ?? '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
                            <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-xs font-semibold text-white/55">{pct}%</div>
                          {low && (
                            <span className="animate-pulse rounded-full bg-red-500/20 px-2 py-1 text-[11px] font-extrabold text-red-200">
                              LOW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <PortalButton variant="ghost" onClick={() => openEditMaterial(m)}>
                          Edit
                        </PortalButton>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableShell>
        )
      )}

      {tab === 'requests' && (
        <TableShell>
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs font-bold text-white/60">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Requested By</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Material</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {requestRows.map(({ r, by, proj, mat }) => (
                <tr key={r.id} className="text-white/80">
                  <td className="px-5 py-4">{r.date}</td>
                  <td className="px-5 py-4 font-extrabold text-white">{by?.name ?? '—'}</td>
                  <td className="px-5 py-4">{proj?.name ?? '—'}</td>
                  <td className="px-5 py-4">{mat?.name ?? '—'}</td>
                  <td className="px-5 py-4">{r.qty}</td>
                  <td className="px-5 py-4">
                    <Badge tone={reqTone(r.status)}>{r.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {r.status === 'Pending' ? (
                      <div className="inline-flex items-center gap-2">
                        <PortalButton
                          variant="outline"
                          onClick={() => {
                            updateInventoryRequest(r.id, { status: 'Rejected' })
                            toast.push({ tone: 'warning', title: 'Request rejected' })
                          }}
                        >
                          Reject
                        </PortalButton>
                        <PortalButton
                          onClick={() => {
                            updateInventoryRequest(r.id, { status: 'Approved' })
                            toast.push({ tone: 'success', title: 'Request approved' })
                          }}
                        >
                          Approve
                        </PortalButton>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-white/45">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}

      <Modal
        open={openEdit}
        title="Edit stock"
        onClose={() => setOpenEdit(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={saveEditMaterial}>Save</PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Total stock" value={editTotal} onChange={setEditTotal} type="number" />
          <Input label="Used" value={editUsed} onChange={setEditUsed} type="number" />
          <Input label="Min stock (alert)" value={editMin} onChange={setEditMin} type="number" />
        </div>
      </Modal>

      <Modal
        open={openAdd}
        title="+ Add Material"
        onClose={() => setOpenAdd(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenAdd(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={add} disabled={!matName.trim()}>
              Add Material
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Material Name" value={matName} onChange={setMatName} />
          <Select
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as Material['category'])}
            options={categoryChips.map((c) => ({ label: c, value: c }))}
          />
          <Input label="Unit" value={unit} onChange={setUnit} placeholder="e.g., Bags" />
          <Input label="Opening Stock" value={opening} onChange={setOpening} type="number" />
          <Select label="Vendor" value={vendorId} onChange={setVendorId} options={vendorOptions} />
          <Select label="Assign Project" value={projectId} onChange={setProjectId} options={projectOptions} />
        </div>
      </Modal>
    </div>
  )
}

