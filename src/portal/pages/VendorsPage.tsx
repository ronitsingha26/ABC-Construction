import { useMemo, useState } from 'react'
import { Plus, Search, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePortalStore } from '../store'
import { EmptyState, Input, Modal, PortalButton, PortalCard, Select, TableShell } from '../ui'
import { usePortalSearch } from '../search'
import { usePortalToast } from '../toast'

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

export function VendorsPage() {
  const { vendors, materials, addVendor, updateVendor } = usePortalStore()
  const global = usePortalSearch()
  const toast = usePortalToast()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Material Supplier')
  const [contactPerson, setContactPerson] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [rating, setRating] = useState('4.0')
  const [pending, setPending] = useState('0')

  const rows = useMemo(() => {
    const needle = (q.trim() || global.query.trim()).toLowerCase()
    return vendors.filter((v) => {
      if (!needle) return true
      return (
        v.name.toLowerCase().includes(needle) ||
        v.category.toLowerCase().includes(needle) ||
        v.city.toLowerCase().includes(needle)
      )
    })
  }, [global.query, q, vendors])

  const openCreate = () => {
    setEditingId(null)
    setName('')
    setCategory('Material Supplier')
    setContactPerson('')
    setCity('')
    setPhone('')
    setRating('4.0')
    setPending('0')
    setOpen(true)
  }

  const openEdit = (id: string) => {
    const v = vendors.find((x) => x.id === id)
    if (!v) return
    setEditingId(id)
    setName(v.name)
    setCategory(v.category)
    setContactPerson(v.contactPerson ?? '')
    setCity(v.city)
    setPhone(v.phone)
    setRating(String(v.rating ?? 4))
    setPending(String(v.pendingPaymentRupees ?? 0))
    setOpen(true)
  }

  const save = () => {
    const payload = {
      name: name.trim(),
      category: category.trim(),
      contactPerson: contactPerson.trim() || undefined,
      city: city.trim(),
      phone: phone.trim(),
      rating: Math.max(1, Math.min(5, Number(rating) || 0)) || undefined,
      pendingPaymentRupees: Math.max(0, Number(pending) || 0) || undefined,
    }
    if (!payload.name || !payload.category || !payload.city || !payload.phone) return
    if (editingId) {
      updateVendor(editingId, payload)
      toast.push({ tone: 'success', title: 'Vendor updated' })
    } else {
      addVendor(payload)
      toast.push({ tone: 'success', title: 'Vendor added' })
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-2xl font-extrabold text-white">Vendors</div>
          <div className="mt-1 text-sm text-white/60">
            Manage vendor directory and materials supplied.
          </div>
        </div>
        <PortalButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Vendor
        </PortalButton>
      </PortalCard>

      <PortalCard className="flex items-end justify-between gap-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search vendors…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none ring-orange-500/35 focus:ring-2"
          />
        </div>
      </PortalCard>

      {rows.length === 0 ? (
        <EmptyState title="No vendors found" subtitle="Add vendors to map inventory purchases." />
      ) : (
        <TableShell>
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs font-bold text-white/60">
              <tr>
                <th className="px-5 py-3">Vendor Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Materials</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Pending Payment</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((v) => {
                const supplied = materials.filter((m) => m.vendorId === v.id).length
                const orders = Math.max(0, Math.round((v.rating ?? 4) * 6))
                const pendingPay = v.pendingPaymentRupees ?? 0
                return (
                  <tr key={v.id} className="text-white/80">
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-white">{v.name}</div>
                      <div className="mt-1 text-xs font-semibold text-white/45">
                        {v.contactPerson ?? '—'} • {v.phone}
                      </div>
                    </td>
                    <td className="px-5 py-4">{v.category}</td>
                    <td className="px-5 py-4">
                      <div className="text-white/85">{v.contactPerson ?? '—'}</div>
                      <div className="mt-1 text-xs font-semibold text-white/45">{v.phone}</div>
                    </td>
                    <td className="px-5 py-4">{v.city}</td>
                    <td className="px-5 py-4">{supplied}</td>
                    <td className="px-5 py-4">{orders}</td>
                    <td className="px-5 py-4">
                      ₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(pendingPay)}
                    </td>
                    <td className="px-5 py-4">
                      <Stars value={v.rating ?? 4} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/portal/vendors/${v.id}`}>
                        <PortalButton variant="outline" className="mr-2">
                          View
                        </PortalButton>
                      </Link>
                      <PortalButton variant="ghost" onClick={() => openEdit(v.id)}>
                        Edit
                      </PortalButton>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableShell>
      )}

      <Modal
        open={open}
        title={editingId ? 'Edit Vendor' : 'Add Vendor'}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={save} disabled={!name.trim() || !category.trim()}>
              Save
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Vendor Name" value={name} onChange={setName} placeholder="e.g., Shakti Steel Traders" />
          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { label: 'Material Supplier', value: 'Material Supplier' },
              { label: 'Labor Contractor', value: 'Labor Contractor' },
              { label: 'Equipment Rental', value: 'Equipment Rental' },
              { label: 'Transport', value: 'Transport' },
            ]}
          />
          <Input label="Contact Person" value={contactPerson} onChange={setContactPerson} placeholder="e.g., Mahesh Singh" />
          <Input label="City" value={city} onChange={setCity} placeholder="e.g., Patna" />
          <Input label="Phone" value={phone} onChange={setPhone} placeholder="+91..." />
          <Input label="Rating (1-5)" value={rating} onChange={setRating} type="number" />
          <Input label="Pending Payment (₹)" value={pending} onChange={setPending} type="number" />
        </div>
      </Modal>
    </div>
  )
}

