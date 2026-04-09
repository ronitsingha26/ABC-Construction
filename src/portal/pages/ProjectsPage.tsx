import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { usePortalStore, type ProjectStatus, type ProjectType } from '../store'
import { Badge, ConfirmModal, EmptyState, Modal, PortalButton, PortalCard, Select, TableShell } from '../ui'
import { usePortalSearch } from '../search'

const statusOptions: { label: string; value: ProjectStatus | 'All' }[] = [
  { label: 'All statuses', value: 'All' },
  { label: 'Planning', value: 'Planning' },
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Delayed', value: 'Delayed' },
  { label: 'Completed', value: 'Completed' },
]

export function ProjectsPage() {
  const {
    projects,
    clients,
    employees,
    addProject,
    updateProject,
    deleteProject,
    updateProjectDetail,
    projectDetails,
  } = usePortalStore()
  const global = usePortalSearch()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'All'>('All')
  const [city, setCity] = useState<string>('All')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('2026-04-10')
  const [deadline, setDeadline] = useState('2026-12-30')
  const [description, setDescription] = useState('')
  const [managerId, setManagerId] = useState(employees[0]?.id ?? '')
  const [type, setType] = useState<ProjectType>('Residential')
  const [pStatus, setPStatus] = useState<ProjectStatus>('Planning')
  const [touched, setTouched] = useState(false)

  const rows = useMemo(() => {
    const needle = (q.trim() || global.query.trim()).toLowerCase()
    return projects
      .filter((p) => (status === 'All' ? true : p.status === status))
      .filter((p) => (city === 'All' ? true : p.city === city))
      .filter((p) => {
        if (!needle) return true
        const c = clients.find((x) => x.id === p.clientId)?.name ?? ''
        return (
          p.name.toLowerCase().includes(needle) ||
          p.city.toLowerCase().includes(needle) ||
          p.location.toLowerCase().includes(needle) ||
          c.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
  }, [city, clients, global.query, projects, q, status])

  const clientOptions = clients.map((c) => ({ label: `${c.name} (${c.city})`, value: c.id }))
  const managerOptions = employees.map((e) => ({ label: `${e.name} — ${e.role}`, value: e.id }))
  const cityOptions = [
    { label: 'All cities', value: 'All' },
    ...Array.from(new Set(projects.map((p) => p.city))).sort().map((c) => ({ label: c, value: c })),
  ]

  const total = projects.length
  const [page, setPage] = useState(1)
  const pageSize = 10
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const paged = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [page, rows])

  const openCreate = () => {
    setEditingId(null)
    setTouched(false)
    setName('')
    setClientId(clients[0]?.id ?? '')
    setLocation('')
    setBudget('')
    setPStatus('Planning')
    setStartDate('2026-04-10')
    setDeadline('2026-12-30')
    setDescription('')
    setManagerId(employees[0]?.id ?? '')
    setType('Residential')
    setOpen(true)
  }

  const openEdit = (id: string) => {
    const p = projects.find((x) => x.id === id)
    if (!p) return
    const d = projectDetails[id]
    setEditingId(id)
    setTouched(false)
    setName(p.name)
    setClientId(p.clientId)
    setLocation(p.location)
    setBudget(String(p.budgetRupees))
    setPStatus(p.status)
    setStartDate(p.startDate)
    setDeadline(p.deadline)
    setDescription(d?.description ?? '')
    setManagerId(d?.managerEmployeeId ?? employees[0]?.id ?? '')
    setType(d?.type ?? 'Residential')
    setOpen(true)
  }

  const save = () => {
    setTouched(true)
    const budgetRupees = Math.max(0, Number(budget) || 0)
    const reqOk =
      !!name.trim() &&
      !!clientId &&
      !!location.trim() &&
      budgetRupees > 0 &&
      !!startDate &&
      !!deadline
    if (!reqOk) return

    const payload = {
      name: name.trim(),
      clientId,
      location: location.trim(),
      city: location.trim().split(',').slice(0, 1).join('').trim() || '—',
      budgetRupees,
      status: pStatus,
      progress: 0,
      startDate,
      deadline,
    }
    if (editingId) updateProject(editingId, payload)
    else {
      const newId = addProject(payload)
      updateProjectDetail(newId, {
        description,
        type,
        managerEmployeeId: managerId,
      })
    }
    if (editingId) {
      updateProjectDetail(editingId, {
        description,
        type,
        managerEmployeeId: managerId,
      })
    }
    setOpen(false)
  }

  const statusTone = (s: ProjectStatus) =>
    s === 'Completed' ? 'green' : s === 'Ongoing' ? 'orange' : s === 'Delayed' ? 'red' : 'blue'

  const progressBarClass = (p: number) =>
    p < 30 ? 'bg-red-400' : p < 70 ? 'bg-orange-400' : 'bg-emerald-400'

  const fmtInr = (n: number) => new Intl.NumberFormat('en-IN').format(Math.round(n))

  const valid = {
    name: !!name.trim(),
    clientId: !!clientId,
    location: !!location.trim(),
    budget: (Number(budget) || 0) > 0,
    startDate: !!startDate,
    deadline: !!deadline,
  }

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="font-heading text-2xl font-extrabold text-white">Projects</div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/75">
            {total}
          </span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
              placeholder="Search projects…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none ring-orange-500/35 focus:ring-2"
            />
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v as any)
              setPage(1)
            }}
            options={statusOptions.map((o) => ({ label: o.label, value: o.value }))}
          />
          <Select
            label="City"
            value={city}
            onChange={(v) => {
              setCity(v)
              setPage(1)
            }}
            options={cityOptions}
          />
          <PortalButton onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Project
          </PortalButton>
        </div>
      </PortalCard>

      {rows.length === 0 ? (
        <EmptyState
          title="No projects found"
          subtitle="Try adjusting your search or create a new project."
          action={
            <PortalButton onClick={openCreate}>
              <Plus className="h-4 w-4" /> New Project
            </PortalButton>
          }
        />
      ) : (
        <TableShell>
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs font-bold text-white/60">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Project Name</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Budget (₹)</th>
                <th className="px-5 py-3">Start Date</th>
                <th className="px-5 py-3">Deadline</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paged.map((p, idx) => {
                const client = clients.find((c) => c.id === p.clientId)
                return (
                  <tr key={p.id} className="text-white/80">
                    <td className="px-5 py-4 text-white/55">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-white">{p.name}</div>
                      <div className="mt-1 text-xs font-semibold text-white/45">{p.city}</div>
                    </td>
                    <td className="px-5 py-4">{client?.name ?? '—'}</td>
                    <td className="px-5 py-4">{p.location}</td>
                    <td className="px-5 py-4">₹{fmtInr(p.budgetRupees)}</td>
                    <td className="px-5 py-4">{p.startDate}</td>
                    <td className="px-5 py-4">{p.deadline}</td>
                    <td className="px-5 py-4"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${progressBarClass(p.progress)}`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <div className="text-xs font-semibold text-white/55">
                          {p.progress}%
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/portal/projects/${p.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(p.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteId(p.id)
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-red-200 transition hover:bg-white/10"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </TableShell>
      )}

      {rows.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-xs font-semibold text-white/55">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, rows.length)} of {rows.length}
          </div>
          <div className="flex items-center gap-2">
            <PortalButton variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </PortalButton>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/85">
              {page} / {pageCount}
            </div>
            <PortalButton variant="outline" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>
              Next
            </PortalButton>
          </div>
        </div>
      )}

      <Modal
        open={open}
        title={editingId ? 'Edit Project' : 'New Project'}
        onClose={() => {
          setOpen(false)
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={save}>
              {editingId ? 'Save Changes' : 'Create Project'}
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className={touched && !valid.name ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <label className="text-sm font-semibold text-white/70">Project Name*</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div className={touched && !valid.clientId ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <Select label="Client*" value={clientId} onChange={setClientId} options={clientOptions} />
          </div>
          <div className={`md:col-span-2 ${touched && !valid.location ? 'rounded-2xl border border-red-500/40 p-3' : ''}`}>
            <label className="text-sm font-semibold text-white/70">Location*</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Mumbai, Maharashtra" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div className={touched && !valid.budget ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <label className="text-sm font-semibold text-white/70">Budget (₹)*</label>
            <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div className={touched && !valid.startDate ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <label className="text-sm font-semibold text-white/70">Start Date*</label>
            <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div className={touched && !valid.deadline ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <label className="text-sm font-semibold text-white/70">Expected End Date*</label>
            <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-white/70">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <Select label="Assign Project Manager" value={managerId} onChange={setManagerId} options={managerOptions} />
          <Select
            label="Project Type"
            value={type}
            onChange={(v) => setType(v as ProjectType)}
            options={[
              { label: 'Residential', value: 'Residential' },
              { label: 'Commercial', value: 'Commercial' },
              { label: 'Industrial', value: 'Industrial' },
              { label: 'Infrastructure', value: 'Infrastructure' },
            ]}
          />
          <Select
            label="Status"
            value={pStatus}
            onChange={(v) => setPStatus(v as ProjectStatus)}
            options={[
              { label: 'Planning', value: 'Planning' },
              { label: 'Ongoing', value: 'Ongoing' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Delayed', value: 'Delayed' },
            ]}
          />
        </div>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete project?"
        message="Are you sure? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (!deleteId) return
          deleteProject(deleteId)
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  )
}

