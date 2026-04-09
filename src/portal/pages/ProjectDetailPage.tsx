import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Plus,
  Receipt,
} from 'lucide-react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  usePortalStore,
  type ProjectMaterialStatus,
  type ProjectPaymentStatus,
  type ProjectPaymentType,
  type ProjectTaskPriority,
  type ProjectTaskStatus,
  type ProjectType,
} from '../store'
import {
  Badge,
  EmptyState,
  Input,
  Modal,
  PortalButton,
  PortalCard,
  Select,
  TableShell,
} from '../ui'

const statusTone = (s: string) =>
  s === 'Completed'
    ? 'green'
    : s === 'Ongoing'
      ? 'orange'
      : s === 'Delayed'
        ? 'red'
        : 'blue'

function rupeesToCrLakh(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  return `₹${(n / 1_00_000).toFixed(1)} L`
}

function progressTone(p: number) {
  if (p < 30) return 'bg-red-400'
  if (p < 70) return 'bg-orange-400'
  return 'bg-emerald-400'
}

function typeTone(t: ProjectType) {
  if (t === 'Infrastructure') return 'blue'
  if (t === 'Industrial') return 'slate'
  if (t === 'Commercial') return 'orange'
  return 'green'
}

function priorityTone(p: ProjectTaskPriority) {
  if (p === 'High') return 'red'
  if (p === 'Medium') return 'orange'
  return 'slate'
}

function materialTone(s: ProjectMaterialStatus) {
  if (s === 'Delivered') return 'green'
  if (s === 'Partial') return 'orange'
  return 'orange'
}

export function ProjectDetailPage() {
  const { id } = useParams()
  const store = usePortalStore()
  const project = store.projects.find((p) => p.id === id)
  const client = project ? store.clients.find((c) => c.id === project.clientId) : null

  const [tab, setTab] = useState<
    'overview' | 'tasks' | 'employees' | 'materials' | 'payments'
  >('overview')

  const detail = project ? store.getProjectDetail(project.id) : undefined

  const manager = useMemo(() => {
    if (!detail) return null
    return store.employees.find((e) => e.id === detail.managerEmployeeId) ?? null
  }, [detail, store.employees])

  const spent = detail?.spentRupees ?? 0
  const remaining = project ? Math.max(0, project.budgetRupees - spent) : 0

  const budgetPie = useMemo(
    () => [
      { name: 'Spent', value: spent, color: '#f97316' },
      { name: 'Remaining', value: remaining, color: 'rgba(255,255,255,0.18)' },
    ],
    [remaining, spent],
  )

  const [openEdit, setOpenEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editBudget, setEditBudget] = useState('')
  const [editStart, setEditStart] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editType, setEditType] = useState<ProjectType>('Residential')
  const [editDesc, setEditDesc] = useState('')
  const [editManager, setEditManager] = useState(store.employees[0]?.id ?? '')

  const openEditModal = () => {
    if (!project) return
    const d = store.getProjectDetail(project.id)
    setEditName(project.name)
    setEditLocation(project.location)
    setEditBudget(String(project.budgetRupees))
    setEditStart(project.startDate)
    setEditDeadline(project.deadline)
    setEditType(d?.type ?? 'Residential')
    setEditDesc(d?.description ?? '')
    setEditManager(d?.managerEmployeeId ?? store.employees[0]?.id ?? '')
    setOpenEdit(true)
  }

  const saveEdit = () => {
    if (!project) return
    const budget = Math.max(0, Number(editBudget) || 0)
    store.updateProject(project.id, {
      name: editName.trim() || project.name,
      location: editLocation.trim() || project.location,
      budgetRupees: budget,
      startDate: editStart,
      deadline: editDeadline,
    })
    store.updateProjectDetail(project.id, {
      type: editType,
      description: editDesc,
      managerEmployeeId: editManager,
    })
    setOpenEdit(false)
  }

  const [openTask, setOpenTask] = useState<null | ProjectTaskStatus>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskAssignee, setTaskAssignee] = useState(store.employees[0]?.id ?? '')
  const [taskDue, setTaskDue] = useState('2026-04-20')
  const [taskPriority, setTaskPriority] = useState<ProjectTaskPriority>('Medium')

  const addTask = () => {
    if (!project || !detail || !openTask || !taskTitle.trim()) return
    const next = {
      id: `tsk_${Date.now()}`,
      title: taskTitle.trim(),
      status: openTask,
      assigneeEmployeeId: taskAssignee,
      dueDate: taskDue,
      priority: taskPriority,
    }
    store.updateProjectDetail(project.id, {
      tasks: [next, ...(detail.tasks ?? [])],
    })
    setTaskTitle('')
    setOpenTask(null)
  }

  const [openAssign, setOpenAssign] = useState(false)
  const [assignEmpId, setAssignEmpId] = useState(store.employees[0]?.id ?? '')

  const assignEmployee = () => {
    if (!project || !detail || !assignEmpId) return
    const exists = (detail.employees ?? []).some((e) => e.employeeId === assignEmpId)
    if (exists) return setOpenAssign(false)
    const next = { employeeId: assignEmpId, daysPresent: 0, attendancePct: 0 }
    store.updateProjectDetail(project.id, {
      employees: [next, ...(detail.employees ?? [])],
    })
    setOpenAssign(false)
  }

  const [openMaterial, setOpenMaterial] = useState(false)
  const [matId, setMatId] = useState(store.materials[0]?.id ?? '')
  const [matCategory, setMatCategory] = useState('Cement')
  const [qtyReq, setQtyReq] = useState('100')
  const [qtyRec, setQtyRec] = useState('0')
  const [matStatus, setMatStatus] = useState<ProjectMaterialStatus>('Pending')
  const [vendorId, setVendorId] = useState(store.vendors[0]?.id ?? '')

  const requestMaterial = () => {
    if (!project || !detail) return
    const m = store.materials.find((x) => x.id === matId)
    if (!m) return
    const req = Math.max(0, Number(qtyReq) || 0)
    const rec = Math.max(0, Number(qtyRec) || 0)
    const next = {
      id: `mr_${Date.now()}`,
      materialId: matId,
      category: matCategory.trim() || 'Material',
      qtyRequested: req,
      qtyReceived: rec,
      unit: m.unit,
      status: matStatus,
      vendorId,
    }
    store.updateProjectDetail(project.id, {
      materials: [next, ...(detail.materials ?? [])],
    })
    setOpenMaterial(false)
  }

  const [openPayment, setOpenPayment] = useState(false)
  const [payType, setPayType] = useState<ProjectPaymentType>('Advance')
  const [payAmount, setPayAmount] = useState('1000000')
  const [payFromTo, setPayFromTo] = useState('Client → ABC Construction')
  const [payStatus, setPayStatus] = useState<ProjectPaymentStatus>('Pending')
  const [payDate, setPayDate] = useState('2026-04-10')

  const recordPayment = () => {
    if (!project || !detail) return
    const amt = Math.max(0, Number(payAmount) || 0)
    if (amt <= 0) return
    const next = {
      id: `pay_${Date.now()}`,
      date: payDate,
      type: payType,
      amountRupees: amt,
      fromTo: payFromTo.trim(),
      status: payStatus,
    }
    store.updateProjectDetail(project.id, {
      payments: [next, ...(detail.payments ?? [])],
    })
    setOpenPayment(false)
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link
          to="/portal/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
        <EmptyState title="Project not found" subtitle="This project may have been removed." />
      </div>
    )
  }

  const d = detail ?? store.getProjectDetail(project.id)

  return (
    <div className="space-y-6">
      <PortalCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              to="/portal/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div className="mt-2 font-heading text-2xl font-extrabold text-white">
              {project.name}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(project.status)}>{project.status}</Badge>
              <Badge tone={typeTone(d.type)}>{d.type}</Badge>
              <span className="text-sm text-white/55">
                {client?.name ?? '—'} • {project.location}
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs font-semibold text-white/55">Budget</div>
                <div className="mt-1 text-sm font-extrabold text-white">
                  {rupeesToCrLakh(project.budgetRupees)}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs font-semibold text-white/55">Spent</div>
                <div className="mt-1 text-sm font-extrabold text-orange-200">
                  {rupeesToCrLakh(spent)}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs font-semibold text-white/55">Remaining</div>
                <div className="mt-1 text-sm font-extrabold text-emerald-200">
                  {rupeesToCrLakh(remaining)}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/55">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${progressTone(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <PortalButton variant="outline" onClick={openEditModal}>
              <Pencil className="h-4 w-4" /> Edit
            </PortalButton>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'tasks', label: 'Tasks' },
              { id: 'employees', label: 'Employees' },
              { id: 'materials', label: 'Materials' },
              { id: 'payments', label: 'Payments' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as any)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  tab === t.id
                    ? 'bg-orange-500 text-slate-950'
                    : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </PortalCard>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <PortalCard>
            <div className="font-heading text-lg font-extrabold">Overview</div>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div>
                <div className="text-xs font-semibold text-white/55">Description</div>
                <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  {d.description || '—'}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-white/55">Timeline</div>
                  <div className="mt-1 font-extrabold text-white">
                    {project.startDate} → {project.deadline}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-white/55">Assigned Manager</div>
                  <div className="mt-1 font-extrabold text-white">
                    {manager?.name ?? '—'}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-white/55">Project Type</div>
                  <div className="mt-1 font-extrabold text-white">{d.type}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-white/55">Location</div>
                  <div className="mt-1 font-extrabold text-white">{project.location}</div>
                </div>
              </div>
            </div>
          </PortalCard>

          <PortalCard>
            <div className="font-heading text-lg font-extrabold">Budget breakdown</div>
            <div className="mt-1 text-xs font-semibold text-white/55">Spent vs Remaining</div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 14,
                      color: 'var(--color-text)',
                    }}
                    formatter={(v: any) => rupeesToCrLakh(Number(v))}
                  />
                  <Pie data={budgetPie} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={3}>
                    {budgetPie.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5">
              <div className="font-heading text-lg font-extrabold">Milestones</div>
              <div className="mt-4 space-y-3">
                {(d.milestones ?? []).slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-400" />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-white">{m.title}</div>
                        <div className="text-xs font-semibold text-white/55">{m.date}</div>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-white/65">
                        {m.status === 'Done' ? '✓ Done' : m.status === 'Ongoing' ? '🔄 Ongoing' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PortalCard>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {(['To Do', 'In Progress', 'Done'] as ProjectTaskStatus[]).map((col) => {
            const tasks = (d.tasks ?? []).filter((t) => t.status === col)
            const headerTone =
              col === 'Done'
                ? 'bg-emerald-500/15 text-emerald-200'
                : col === 'In Progress'
                  ? 'bg-orange-500/15 text-orange-200'
                  : 'bg-white/10 text-white/75'
            return (
              <PortalCard key={col}>
                <div className="flex items-center justify-between gap-3">
                  <div className={`rounded-full px-3 py-1 text-xs font-extrabold ${headerTone}`}>
                    {col}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/70">
                    {tasks.length}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {tasks.map((t) => {
                    const assignee = store.employees.find((e) => e.id === t.assigneeEmployeeId)
                    return (
                      <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-extrabold text-white">{t.title}</div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                assignee?.name ?? 'User',
                              )}&background=0F172A&color=F8FAFC&size=48&bold=true`}
                              alt={assignee?.name ?? 'Assignee'}
                              className="h-7 w-7 rounded-full border border-white/10"
                            />
                            <div className="text-xs font-semibold text-white/65">
                              {assignee?.name ?? '—'}
                            </div>
                          </div>
                          <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                        </div>
                        <div className="mt-2 text-xs font-semibold text-white/45">
                          Due {t.dueDate}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4">
                  <PortalButton variant="outline" onClick={() => setOpenTask(col)} className="w-full">
                    <Plus className="h-4 w-4" /> Add Task
                  </PortalButton>
                </div>
              </PortalCard>
            )
          })}
        </div>
      )}

      {tab === 'employees' && (
        <PortalCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-heading text-lg font-extrabold">Employees</div>
              <div className="text-xs font-semibold text-white/55">Assigned to this project</div>
            </div>
            <PortalButton onClick={() => setOpenAssign(true)}>
              <Plus className="h-4 w-4" /> Assign Employee
            </PortalButton>
          </div>

          <div className="mt-4">
            <TableShell>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs font-bold text-white/60">
                  <tr>
                    <th className="px-5 py-3">Avatar</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Days Present</th>
                    <th className="px-5 py-3">Attendance %</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(d.employees ?? []).map((pe) => {
                    const emp = store.employees.find((e) => e.id === pe.employeeId)
                    return (
                      <tr key={pe.employeeId} className="text-white/80">
                        <td className="px-5 py-4">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              emp?.name ?? 'User',
                            )}&background=0F172A&color=F8FAFC&size=48&bold=true`}
                            alt={emp?.name ?? 'Employee'}
                            className="h-8 w-8 rounded-full border border-white/10"
                          />
                        </td>
                        <td className="px-5 py-4 font-extrabold text-white">
                          {emp?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4">{emp?.role ?? '—'}</td>
                        <td className="px-5 py-4">{emp?.phone ?? '—'}</td>
                        <td className="px-5 py-4">{pe.daysPresent}</td>
                        <td className="px-5 py-4">{pe.attendancePct}%</td>
                        <td className="px-5 py-4 text-right">
                          <PortalButton
                            variant="ghost"
                            onClick={() => {
                              const next = (d.employees ?? []).filter((x) => x.employeeId !== pe.employeeId)
                              store.updateProjectDetail(project.id, { employees: next })
                            }}
                          >
                            Remove
                          </PortalButton>
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

      {tab === 'materials' && (
        <PortalCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-heading text-lg font-extrabold">Materials</div>
              <div className="text-xs font-semibold text-white/55">Requests and receipts</div>
            </div>
            <PortalButton onClick={() => setOpenMaterial(true)}>
              <Plus className="h-4 w-4" /> Request Material
            </PortalButton>
          </div>

          <div className="mt-4">
            <TableShell>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs font-bold text-white/60">
                  <tr>
                    <th className="px-5 py-3">Material</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Qty Requested</th>
                    <th className="px-5 py-3">Qty Received</th>
                    <th className="px-5 py-3">Unit</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(d.materials ?? []).map((r) => {
                    const mat = store.materials.find((m) => m.id === r.materialId)
                    const v = store.vendors.find((v) => v.id === r.vendorId)
                    return (
                      <tr key={r.id} className="text-white/80">
                        <td className="px-5 py-4 font-extrabold text-white">{mat?.name ?? '—'}</td>
                        <td className="px-5 py-4">{r.category}</td>
                        <td className="px-5 py-4">{r.qtyRequested}</td>
                        <td className="px-5 py-4">{r.qtyReceived}</td>
                        <td className="px-5 py-4">{r.unit}</td>
                        <td className="px-5 py-4">
                          <Badge tone={materialTone(r.status)}>{r.status}</Badge>
                        </td>
                        <td className="px-5 py-4">{v?.name ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </TableShell>
          </div>
        </PortalCard>
      )}

      {tab === 'payments' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <PortalCard className="lg:col-span-1">
            <div className="font-heading text-lg font-extrabold">Summary</div>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <span>Total Budget</span>
                <span className="font-extrabold text-white">{rupeesToCrLakh(project.budgetRupees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Received</span>
                <span className="font-extrabold text-emerald-200">
                  {rupeesToCrLakh(
                    (d.payments ?? [])
                      .filter((p) => p.status === 'Received')
                      .reduce((a, b) => a + b.amountRupees, 0),
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pending</span>
                <span className="font-extrabold text-orange-200">
                  {rupeesToCrLakh(
                    (d.payments ?? [])
                      .filter((p) => p.status === 'Pending')
                      .reduce((a, b) => a + b.amountRupees, 0),
                  )}
                </span>
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white/55">Next Payment Due</div>
                <div className="mt-1 text-sm font-extrabold text-white">
                  {(d.payments ?? []).find((p) => p.status === 'Pending')?.date ?? '—'}
                </div>
              </div>
            </div>
            <div className="mt-5">
              <PortalButton onClick={() => setOpenPayment(true)} className="w-full">
                <Plus className="h-4 w-4" /> Record Payment
              </PortalButton>
            </div>
          </PortalCard>

          <PortalCard className="lg:col-span-2">
            <div className="font-heading text-lg font-extrabold">Transactions</div>
            <div className="mt-1 text-xs font-semibold text-white/55">Timeline</div>

            <div className="mt-4 space-y-3">
              {(d.payments ?? []).map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-extrabold text-white">{p.type}</div>
                      <Badge tone={p.status === 'Received' ? 'green' : 'orange'}>{p.status}</Badge>
                      <div className="text-xs font-semibold text-white/45">{p.date}</div>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-white/60">{p.fromTo}</div>
                    <div className="mt-1 text-sm font-extrabold text-orange-200">{rupeesToCrLakh(p.amountRupees)}</div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10"
                    aria-label="Receipt"
                  >
                    <Receipt className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </PortalCard>
        </div>
      )}

      {/* Modals */}
      <Modal
        open={openEdit}
        title="Edit Project"
        onClose={() => setOpenEdit(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={saveEdit} disabled={!editName.trim() || !editLocation.trim()}>
              Save
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Project Name*" value={editName} onChange={setEditName} />
          <Input label="Location*" value={editLocation} onChange={setEditLocation} />
          <Input label="Budget (₹)*" value={editBudget} onChange={setEditBudget} type="number" />
          <Input label="Start Date*" value={editStart} onChange={setEditStart} type="date" />
          <Input label="Deadline*" value={editDeadline} onChange={setEditDeadline} type="date" />
          <Select
            label="Project Type"
            value={editType}
            onChange={(v) => setEditType(v as ProjectType)}
            options={[
              { label: 'Residential', value: 'Residential' },
              { label: 'Commercial', value: 'Commercial' },
              { label: 'Industrial', value: 'Industrial' },
              { label: 'Infrastructure', value: 'Infrastructure' },
            ]}
          />
          <Select
            label="Assign Project Manager"
            value={editManager}
            onChange={setEditManager}
            options={store.employees.map((e) => ({ label: `${e.name} — ${e.role}`, value: e.id }))}
          />
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold text-white/70">Description</label>
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none ring-orange-500/35 focus:ring-2"
            placeholder="Project overview, scope, constraints…"
          />
        </div>
      </Modal>

      <Modal
        open={openTask !== null}
        title="Add Task"
        onClose={() => setOpenTask(null)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenTask(null)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={addTask} disabled={!taskTitle.trim()}>
              Add
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Task title" value={taskTitle} onChange={setTaskTitle} />
          <Select
            label="Column"
            value={openTask ?? 'To Do'}
            onChange={(v) => setOpenTask(v as ProjectTaskStatus)}
            options={[
              { label: 'To Do', value: 'To Do' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Done', value: 'Done' },
            ]}
          />
          <Select
            label="Assigned to"
            value={taskAssignee}
            onChange={setTaskAssignee}
            options={store.employees.map((e) => ({ label: e.name, value: e.id }))}
          />
          <Input label="Due date" value={taskDue} onChange={setTaskDue} type="date" />
          <Select
            label="Priority"
            value={taskPriority}
            onChange={(v) => setTaskPriority(v as ProjectTaskPriority)}
            options={[
              { label: 'High', value: 'High' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Low', value: 'Low' },
            ]}
          />
        </div>
      </Modal>

      <Modal
        open={openAssign}
        title="Assign Employee"
        onClose={() => setOpenAssign(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenAssign(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={assignEmployee} disabled={!assignEmpId}>
              Assign
            </PortalButton>
          </div>
        }
      >
        <Select
          label="Employee"
          value={assignEmpId}
          onChange={setAssignEmpId}
          options={store.employees.map((e) => ({ label: `${e.name} — ${e.role}`, value: e.id }))}
        />
      </Modal>

      <Modal
        open={openMaterial}
        title="Request Material"
        onClose={() => setOpenMaterial(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenMaterial(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={requestMaterial} disabled={!matId}>
              Create Request
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Material"
            value={matId}
            onChange={setMatId}
            options={store.materials.map((m) => ({ label: `${m.name} (${m.unit})`, value: m.id }))}
          />
          <Input label="Category" value={matCategory} onChange={setMatCategory} />
          <Input label="Qty Requested" value={qtyReq} onChange={setQtyReq} type="number" />
          <Input label="Qty Received" value={qtyRec} onChange={setQtyRec} type="number" />
          <Select
            label="Status"
            value={matStatus}
            onChange={(v) => setMatStatus(v as ProjectMaterialStatus)}
            options={[
              { label: 'Pending', value: 'Pending' },
              { label: 'Partial', value: 'Partial' },
              { label: 'Delivered', value: 'Delivered' },
            ]}
          />
          <Select
            label="Vendor"
            value={vendorId}
            onChange={setVendorId}
            options={store.vendors.map((v) => ({ label: v.name, value: v.id }))}
          />
        </div>
      </Modal>

      <Modal
        open={openPayment}
        title="Record Payment"
        onClose={() => setOpenPayment(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <PortalButton variant="outline" onClick={() => setOpenPayment(false)}>
              Cancel
            </PortalButton>
            <PortalButton onClick={recordPayment} disabled={Number(payAmount) <= 0}>
              Save
            </PortalButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Date" value={payDate} onChange={setPayDate} type="date" />
          <Select
            label="Type"
            value={payType}
            onChange={(v) => setPayType(v as ProjectPaymentType)}
            options={[
              { label: 'Advance', value: 'Advance' },
              { label: 'Milestone', value: 'Milestone' },
              { label: 'Final', value: 'Final' },
            ]}
          />
          <Input label="Amount (₹)" value={payAmount} onChange={setPayAmount} type="number" />
          <Select
            label="Status"
            value={payStatus}
            onChange={(v) => setPayStatus(v as ProjectPaymentStatus)}
            options={[
              { label: 'Pending', value: 'Pending' },
              { label: 'Received', value: 'Received' },
            ]}
          />
          <div className="md:col-span-2">
            <Input label="From / To" value={payFromTo} onChange={setPayFromTo} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

