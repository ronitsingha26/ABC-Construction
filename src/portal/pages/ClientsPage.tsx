import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePortalStore } from '../store'
import { EmptyState, Input, Modal, PortalButton, PortalCard } from '../ui'
import { usePortalSearch } from '../search'
import { usePortalToast } from '../toast'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('')
}

function avatarTone(seed: string) {
  const n = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0) % 6
  return [
    'from-orange-500/25 to-orange-500/10 border-orange-400/25 text-orange-200',
    'from-emerald-500/25 to-emerald-500/10 border-emerald-400/25 text-emerald-200',
    'from-sky-500/25 to-sky-500/10 border-sky-400/25 text-sky-200',
    'from-fuchsia-500/25 to-fuchsia-500/10 border-fuchsia-400/25 text-fuchsia-200',
    'from-amber-500/25 to-amber-500/10 border-amber-400/25 text-amber-200',
    'from-indigo-500/25 to-indigo-500/10 border-indigo-400/25 text-indigo-200',
  ][n]
}

export function ClientsPage() {
  const { clients, projects, addClient, updateClient } = usePortalStore()
  const global = usePortalSearch()
  const toast = usePortalToast()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [gstin, setGstin] = useState('')
  const [notes, setNotes] = useState('')

  const rows = useMemo(() => {
    const needle = (q.trim() || global.query.trim()).toLowerCase()
    return clients.filter((c) => {
      if (!needle) return true
      return (
        c.name.toLowerCase().includes(needle) ||
        c.city.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle)
      )
    })
  }, [clients, global.query, q])

  const openCreate = () => {
    setEditingId(null)
    setCompanyName('')
    setContactPerson('')
    setCity('')
    setPhone('')
    setEmail('')
    setAddress('')
    setGstin('')
    setNotes('')
    setOpen(true)
  }

  const openEdit = (id: string) => {
    const c = clients.find((x) => x.id === id)
    if (!c) return
    setEditingId(id)
    setCompanyName(c.name)
    setContactPerson(c.contactPerson ?? '')
    setCity(c.city)
    setPhone(c.phone)
    setEmail(c.email)
    setAddress(c.address ?? '')
    setGstin(c.gstin ?? '')
    setNotes(c.notes ?? '')
    setOpen(true)
  }

  const save = () => {
    const payload = {
      name: companyName.trim(),
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || undefined,
      city: city.trim(),
      gstin: gstin.trim() || undefined,
      notes: notes.trim() || undefined,
    }
    if (!payload.name || !payload.city || !payload.phone || !payload.email) return
    if (editingId) {
      updateClient(editingId, payload)
      toast.push({ tone: 'success', title: 'Client updated' })
    } else {
      addClient(payload)
      toast.push({ tone: 'success', title: 'Client added' })
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-2xl font-extrabold text-white">Clients</div>
          <div className="mt-1 text-sm text-white/60">
            Manage client records and linked projects.
          </div>
        </div>
        <PortalButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Client
        </PortalButton>
      </PortalCard>

      <PortalCard className="flex items-end justify-between gap-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none ring-orange-500/35 focus:ring-2"
          />
        </div>
      </PortalCard>

      {rows.length === 0 ? (
        <EmptyState title="No clients found" subtitle="Add a client to link with projects and invoices." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {rows.map((c) => {
            const activeProjects = projects.filter(
              (p) => p.clientId === c.id && (p.status === 'Ongoing' || p.status === 'Delayed' || p.status === 'Planning'),
            ).length
            const business = c.totalBusinessCr ?? 0
            const tone = avatarTone(c.name)
            return (
              <PortalCard key={c.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={[
                        'grid h-12 w-12 place-items-center rounded-2xl border bg-gradient-to-br text-sm font-extrabold',
                        tone,
                      ].join(' ')}
                    >
                      {initials(c.name)}
                    </div>
                    <div>
                      <div className="font-heading text-lg font-extrabold text-white">{c.name}</div>
                      <div className="mt-1 text-xs font-semibold text-white/55">{c.city}</div>
                    </div>
                  </div>
                  <PortalButton variant="ghost" onClick={() => openEdit(c.id)}>
                    Edit
                  </PortalButton>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold text-white/55">Contact</div>
                    <div className="mt-1 text-sm font-extrabold text-white">
                      {c.contactPerson ?? '—'}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white/55">{c.phone}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs font-semibold text-white/55">Active Projects</div>
                      <div className="mt-1 font-heading text-2xl font-extrabold text-white">
                        {activeProjects}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs font-semibold text-white/55">Total Business</div>
                      <div className="mt-1 font-heading text-2xl font-extrabold text-white">
                        ₹{business.toFixed(1)} Cr
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <Link to={`/portal/clients/${c.id}`}>
                    <PortalButton className="w-full">View Profile</PortalButton>
                  </Link>
                </div>
              </PortalCard>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        title={editingId ? 'Edit Client' : 'Add Client'}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={save} disabled={!companyName.trim() || !email.trim()}>
              Save
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Company Name" value={companyName} onChange={setCompanyName} placeholder="e.g., DLF Ltd" />
          <Input label="Contact Person" value={contactPerson} onChange={setContactPerson} placeholder="e.g., Ramesh Gupta" />
          <Input label="Phone" value={phone} onChange={setPhone} placeholder="+91..." />
          <Input label="Email" value={email} onChange={setEmail} placeholder="accounts@client.com" />
          <Input label="Address" value={address} onChange={setAddress} placeholder="Office / billing address" />
          <Input label="City" value={city} onChange={setCity} placeholder="e.g., Mumbai" />
          <Input label="GSTIN" value={gstin} onChange={setGstin} placeholder="e.g., 27AAACD1234F1Z5" />
          <Input label="Notes" value={notes} onChange={setNotes} placeholder="Internal notes" />
        </div>
      </Modal>
    </div>
  )
}

