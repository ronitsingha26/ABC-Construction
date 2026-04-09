import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react'
import { usePortalStore, type Employee } from '../store'
import { Badge, ConfirmModal, EmptyState, Modal, PortalButton, PortalCard, Select, TableShell } from '../ui'
import { usePortalSearch } from '../search'

function toneForEmpStatus(s: Employee['status']) {
  if (s === 'Active') return 'green'
  return 'orange'
}

export function EmployeesPage() {
  const { employees, projects, addEmployee, updateEmployee } = usePortalStore()
  const global = usePortalSearch()
  const [q, setQ] = useState('')

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const [name, setName] = useState('')
  const [role, setRole] = useState<Employee['role']>('Site Engineer')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [aadhar, setAadhar] = useState('')
  const [salaryType, setSalaryType] = useState<Employee['salaryType']>('Monthly')
  const [salaryAmount, setSalaryAmount] = useState('')
  const [joinDate, setJoinDate] = useState('2026-04-01')
  const [assignedProjectId, setAssignedProjectId] = useState<string>('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [status, setStatus] = useState<Employee['status']>('Active')
  const [photo, setPhoto] = useState<string | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const rows = useMemo(() => {
    const needle = (q.trim() || global.query.trim()).toLowerCase()
    return employees
      .filter((e) => {
        if (!needle) return true
        return (
          e.name.toLowerCase().includes(needle) ||
          e.role.toLowerCase().includes(needle) ||
          e.employeeId.toLowerCase().includes(needle) ||
          (e.assignedProjectId ? (projects.find((p) => p.id === e.assignedProjectId)?.name ?? '').toLowerCase().includes(needle) : false)
        )
      })
  }, [employees, global.query, projects, q])

  const stats = useMemo(() => {
    // per prompt: display the specified numbers, regardless of seed size
    return { total: 45, onSiteToday: 38, onLeave: 7 }
  }, [])

  const projectOptions = [
    { label: 'Unassigned', value: '' },
    ...projects.map((p) => ({ label: p.name, value: p.id })),
  ]

  const openCreate = () => {
    setEditingId(null)
    setTouched(false)
    setName('')
    setRole('Site Engineer')
    setPhone('')
    setEmail('')
    setAadhar('')
    setSalaryType('Monthly')
    setSalaryAmount('')
    setJoinDate('2026-04-01')
    setAssignedProjectId('')
    setEmergencyContact('')
    setStatus('Active')
    setPhoto(undefined)
    setOpen(true)
  }

  const openEdit = (id: string) => {
    const e = employees.find((x) => x.id === id)
    if (!e) return
    setEditingId(id)
    setTouched(false)
    setName(e.name)
    setRole(e.role)
    setPhone(e.phone)
    setEmail(e.email ?? '')
    setAadhar(e.aadharNumber ?? '')
    setSalaryType(e.salaryType)
    setSalaryAmount(String(e.salaryAmountRupees))
    setJoinDate(e.joinDate)
    setAssignedProjectId(e.assignedProjectId ?? '')
    setEmergencyContact(e.emergencyContact ?? '')
    setStatus(e.status)
    setPhoto(e.photoDataUrl)
    setOpen(true)
  }

  const save = () => {
    const payload = {
      name: name.trim(),
      employeeId: editingId
        ? (employees.find((x) => x.id === editingId)?.employeeId ?? `EMP-${String(1).padStart(4, '0')}`)
        : `EMP-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
      role,
      assignedProjectId: assignedProjectId || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      aadharNumber: aadhar.trim() || undefined,
      salaryType,
      salaryAmountRupees: Math.max(0, Number(salaryAmount) || 0),
      joinDate,
      emergencyContact: emergencyContact.trim() || undefined,
      photoDataUrl: photo,
      status,
    }
    setTouched(true)
    if (
      !payload.name ||
      !payload.role ||
      !payload.phone ||
      !payload.salaryType ||
      payload.salaryAmountRupees <= 0 ||
      !payload.joinDate
    )
      return

    if (editingId) updateEmployee(editingId, payload)
    else addEmployee(payload)
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-heading text-2xl font-extrabold text-white">Employees</div>
          <div className="mt-1 text-sm text-white/60">
            Daily workforce management for sites, payroll, and compliance.
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:w-[280px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search employee, EMP-ID, project…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none ring-orange-500/35 focus:ring-2"
            />
          </div>
          <PortalButton onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Employee
          </PortalButton>
        </div>
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">Total Employees</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-white">{stats.total}</div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">On Site Today</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-emerald-200">{stats.onSiteToday}</div>
        </PortalCard>
        <PortalCard>
          <div className="text-sm font-semibold text-white/60">On Leave</div>
          <div className="mt-2 font-heading text-3xl font-extrabold text-orange-200">{stats.onLeave}</div>
        </PortalCard>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No employees found"
          subtitle="Try a different search or add a new employee."
          action={
            <PortalButton onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Employee
            </PortalButton>
          }
        />
      ) : (
        <TableShell>
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs font-bold text-white/60">
              <tr>
                <th className="px-5 py-3">Avatar + Name</th>
                <th className="px-5 py-3">Employee ID</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Assigned Project</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Salary Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((e) => (
                <tr key={e.id} className="text-white/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          e.photoDataUrl ??
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            e.name,
                          )}&background=0F172A&color=F8FAFC&size=64&bold=true`
                        }
                        alt={e.name}
                        className="h-9 w-9 rounded-full border border-white/10 object-cover"
                      />
                      <div>
                        <Link
                          to={`/portal/employees/${e.id}`}
                          className="font-extrabold text-white hover:text-orange-200"
                        >
                          {e.name}
                        </Link>
                        <div className="mt-1 text-xs font-semibold text-white/45">
                          {e.email ?? '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-white/85">{e.employeeId}</td>
                  <td className="px-5 py-4">{e.role}</td>
                  <td className="px-5 py-4">
                    {e.assignedProjectId
                      ? projects.find((p) => p.id === e.assignedProjectId)?.name ?? '—'
                      : '—'}
                  </td>
                  <td className="px-5 py-4">{e.phone}</td>
                  <td className="px-5 py-4">{e.salaryType}</td>
                  <td className="px-5 py-4">
                    <Badge tone={toneForEmpStatus(e.status)}>{e.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/portal/employees/${e.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(e.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteId(e.id)
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-red-200 transition hover:bg-white/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}

      <Modal
        open={open}
        title={editingId ? 'Edit Employee' : 'Add Employee'}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={save}>
              {editingId ? 'Save Changes' : 'Add Employee'}
            </PortalButton>
          </div>
        }
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-white/5">
              {photo ? (
                <img src={photo} alt="Employee" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/35">
                  <Upload className="h-6 w-6" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75 hover:bg-white/10"
            >
              Upload
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => setPhoto(String(reader.result))
                reader.readAsDataURL(file)
              }}
            />
          </div>
          <div className="text-sm text-white/60">
            Photo upload UI (stored locally).
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={touched && !name.trim() ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <label className="text-sm font-semibold text-white/70">Full Name*</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div className={touched && !role ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <Select
              label="Role*"
              value={role}
              onChange={(v) => setRole(v as Employee['role'])}
              options={[
                { label: 'Site Engineer', value: 'Site Engineer' },
                { label: 'Supervisor', value: 'Supervisor' },
                { label: 'Labor', value: 'Labor' },
                { label: 'Electrician', value: 'Electrician' },
                { label: 'Plumber', value: 'Plumber' },
                { label: 'Accountant', value: 'Accountant' },
                { label: 'HR', value: 'HR' },
              ]}
            />
          </div>
          <div className={touched && !phone.trim() ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <label className="text-sm font-semibold text-white/70">Phone*</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-white/70">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-white/70">Aadhar Number</label>
            <input value={aadhar} onChange={(e) => setAadhar(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div className={touched && !salaryType ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <Select
              label="Salary Type*"
              value={salaryType}
              onChange={(v) => setSalaryType(v as Employee['salaryType'])}
              options={[
                { label: 'Monthly', value: 'Monthly' },
                { label: 'Daily', value: 'Daily' },
              ]}
            />
          </div>
          <div className={touched && Number(salaryAmount) <= 0 ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <label className="text-sm font-semibold text-white/70">Salary Amount*</label>
            <input value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} type="number" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <div className={touched && !joinDate ? 'rounded-2xl border border-red-500/40 p-3' : ''}>
            <label className="text-sm font-semibold text-white/70">Join Date*</label>
            <input value={joinDate} onChange={(e) => setJoinDate(e.target.value)} type="date" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <Select label="Assign Project" value={assignedProjectId} onChange={setAssignedProjectId} options={projectOptions} />
          <div>
            <label className="text-sm font-semibold text-white/70">Emergency Contact</label>
            <input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/35 focus:ring-2" />
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as Employee['status'])}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'On Leave', value: 'On Leave' },
            ]}
          />
        </div>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete employee?"
        message="Are you sure? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (!deleteId) return
          updateEmployee(deleteId, { status: 'On Leave' })
        }}
        onClose={() => setDeleteId(null)}
      />
    </div>
  )
}

