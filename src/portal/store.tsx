import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import projectsData from '../data/projects.json'
import employeesData from '../data/employees.json'
import clientsData from '../data/clients.json'
import vendorsData from '../data/vendors.json'
import materialsData from '../data/materials.json'
import transactionsData from '../data/transactions.json'
import payrollData from '../data/payroll.json'

export type ProjectStatus = 'Planning' | 'Ongoing' | 'Delayed' | 'Completed'

export type ProjectType =
  | 'Residential'
  | 'Commercial'
  | 'Industrial'
  | 'Infrastructure'

export type Project = {
  id: string
  name: string
  clientId: string
  location: string
  city: string
  budgetRupees: number
  status: ProjectStatus
  progress: number
  startDate: string
  deadline: string
}

function safeProjectDetail(pd?: ProjectDetail): ProjectDetail {
  return (
    pd ?? {
      description: '',
      type: 'Residential',
      managerEmployeeId: '',
      spentRupees: 0,
      milestones: [],
      tasks: [],
      employees: [],
      materials: [],
      payments: [],
    }
  )
}

export type ProjectMilestoneStatus = 'Done' | 'Ongoing' | 'Pending'
export type ProjectMilestone = {
  id: string
  title: string
  date: string
  status: ProjectMilestoneStatus
}

export type ProjectTaskPriority = 'High' | 'Medium' | 'Low'
export type ProjectTaskStatus = 'To Do' | 'In Progress' | 'Done'
export type ProjectTask = {
  id: string
  title: string
  status: ProjectTaskStatus
  assigneeEmployeeId: string
  dueDate: string
  priority: ProjectTaskPriority
}

export type ProjectEmployee = {
  employeeId: string
  daysPresent: number
  attendancePct: number
}

export type ProjectMaterialStatus = 'Delivered' | 'Pending' | 'Partial'
export type ProjectMaterialRequest = {
  id: string
  materialId: string
  category: string
  qtyRequested: number
  qtyReceived: number
  unit: string
  status: ProjectMaterialStatus
  vendorId: string
}

export type ProjectPaymentType = 'Advance' | 'Milestone' | 'Final'
export type ProjectPaymentStatus = 'Received' | 'Pending'
export type ProjectPayment = {
  id: string
  date: string
  type: ProjectPaymentType
  amountRupees: number
  fromTo: string
  status: ProjectPaymentStatus
}

export type ProjectDetail = {
  description: string
  type: ProjectType
  managerEmployeeId: string
  spentRupees: number
  milestones: ProjectMilestone[]
  tasks: ProjectTask[]
  employees: ProjectEmployee[]
  materials: ProjectMaterialRequest[]
  payments: ProjectPayment[]
}

export type Client = {
  id: string
  name: string // company name (kept for backward compatibility)
  contactPerson?: string
  city: string
  address?: string
  gstin?: string
  notes?: string
  totalBusinessCr?: number
  phone: string
  email: string
}

export type Vendor = {
  id: string
  name: string
  category:
    | 'Material Supplier'
    | 'Labor Contractor'
    | 'Equipment Rental'
    | 'Transport'
    | string
  contactPerson?: string
  city: string
  phone: string
  rating?: number // 1-5
  pendingPaymentRupees?: number
}

export type Employee = {
  id: string
  name: string
  employeeId: string
  role:
    | 'Site Engineer'
    | 'Supervisor'
    | 'Labor'
    | 'Electrician'
    | 'Plumber'
    | 'Accountant'
    | 'HR'
  assignedProjectId?: string
  phone: string
  email?: string
  aadharNumber?: string
  salaryType: 'Monthly' | 'Daily'
  salaryAmountRupees: number
  joinDate: string
  emergencyContact?: string
  photoDataUrl?: string
  status: 'Active' | 'On Leave'
}

export type AttendanceDayStatus = 'Present' | 'Absent' | 'Half Day' | 'Holiday'

export type EmployeeAttendanceMonth = {
  month: string // YYYY-MM
  days: AttendanceDayStatus[] // 35 cells (7x5)
  summary: { present: number; absent: number; halfDay: number; holidays: number }
}

export type PayrollStatus = 'Paid' | 'Pending' | 'Hold'

export type EmployeePayrollRow = {
  month: string // e.g. "June 2025"
  workingDays: number
  basicRupees: number
  overtimeRupees: number
  deductionsRupees: number
  netPaidRupees: number
  status: PayrollStatus
}

export type Material = {
  id: string
  name: string
  category:
    | 'Cement'
    | 'Steel'
    | 'Sand'
    | 'Bricks'
    | 'Paint'
    | 'Electricals'
    | 'Plumbing'
    | 'Other'
  unit: string
  total: number
  used: number
  minStock: number
  vendorId: string
  projectId?: string
  unitPriceRupees?: number
}

export type InventoryRequestStatus = 'Approved' | 'Pending' | 'Rejected'
export type InventoryRequest = {
  id: string
  date: string
  requestedByEmployeeId: string
  projectId: string
  materialId: string
  qty: number
  status: InventoryRequestStatus
}

export type FinanceTransactionType = 'Income' | 'Expense' | 'Advance'
export type FinanceTransactionStatus = 'Cleared' | 'Pending'
export type FinanceTransaction = {
  id: string
  date: string
  description: string
  type: FinanceTransactionType
  amountRupees: number
  projectId?: string
  category:
    | 'Labor'
    | 'Material'
    | 'Equipment'
    | 'Transport'
    | 'Overhead'
    | 'Miscellaneous'
  status: FinanceTransactionStatus
  receiptUrl?: string
}

export type InvoiceLineItem = {
  description: string
  qty: number
  rateRupees: number
}

export type Invoice = {
  id: string
  clientId: string
  projectId: string
  amountRupees: number
  status: 'Paid' | 'Pending' | 'Overdue'
  dueDate: string
  issuedDate: string
  lineItems: InvoiceLineItem[]
}

export type PayrollRun = {
  id: string
  month: string
  processedOn: string
  employees: number
  totalPaidLakh: number
  status: 'Processed' | 'Draft'
}

type Store = {
  projects: Project[]
  projectDetails: Record<string, ProjectDetail>
  getProjectDetail: (id: string) => ProjectDetail
  clients: Client[]
  vendors: Vendor[]
  employees: Employee[]
  employeeAttendance: Record<string, EmployeeAttendanceMonth[]>
  employeePayroll: Record<string, EmployeePayrollRow[]>
  materials: Material[]
  inventoryRequests: InventoryRequest[]
  transactions: FinanceTransaction[]
  invoices: Invoice[]
  payrollRuns: PayrollRun[]
  addProject: (p: Omit<Project, 'id'>) => string
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  updateProjectDetail: (id: string, patch: Partial<ProjectDetail>) => void
  addEmployee: (e: Omit<Employee, 'id'>) => void
  updateEmployee: (id: string, patch: Partial<Employee>) => void
  addClient: (c: Omit<Client, 'id'>) => void
  updateClient: (id: string, patch: Partial<Client>) => void
  addVendor: (v: Omit<Vendor, 'id'>) => void
  updateVendor: (id: string, patch: Partial<Vendor>) => void
  updateMaterial: (id: string, patch: Partial<Material>) => void
  addMaterial: (m: Omit<Material, 'id'>) => void
  addInventoryRequest: (r: Omit<InventoryRequest, 'id'>) => void
  updateInventoryRequest: (id: string, patch: Partial<InventoryRequest>) => void
  addTransaction: (t: Omit<FinanceTransaction, 'id'>) => void
  updateTransaction: (id: string, patch: Partial<FinanceTransaction>) => void
  addInvoice: (inv: Omit<Invoice, 'id'>) => void
  updateInvoice: (id: string, patch: Partial<Invoice>) => void
}

const Ctx = createContext<Store | null>(null)

const LS_KEY = 'abc_portal_store_v1'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

const seed = {
  clients: (clientsData as unknown as Array<{
    id: string
    companyName: string
    contactPerson: string
    phone: string
    email: string
    address: string
    city: string
    gstin: string
    notes: string
    totalBusinessCr: number
  }>).map((c) => ({
    id: c.id,
    name: c.companyName,
    contactPerson: c.contactPerson,
    phone: c.phone,
    email: c.email,
    address: c.address,
    city: c.city,
    gstin: c.gstin,
    notes: c.notes,
    totalBusinessCr: c.totalBusinessCr,
  })) satisfies Client[],
  vendors: (vendorsData as unknown as Array<{
    id: string
    name: string
    category: Vendor['category']
    contactPerson: string
    phone: string
    city: string
    rating: number
    pendingPaymentRupees: number
  }>).map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    contactPerson: v.contactPerson,
    phone: v.phone,
    city: v.city,
    rating: v.rating,
    pendingPaymentRupees: v.pendingPaymentRupees,
  })) satisfies Vendor[],
  projects: projectsData as unknown as Project[],
  projectDetails: {
    p_skyline: {
      description:
        'A premium high-rise residential development with modern amenities and strict quality controls.',
      type: 'Residential',
      managerEmployeeId: 'e_anil',
      spentRupees: 68_00_000,
      milestones: [
        { id: 'ms1', title: 'Foundation', date: '2026-02-05', status: 'Done' },
        { id: 'ms2', title: 'RCC Structure', date: '2026-05-15', status: 'Ongoing' },
        { id: 'ms3', title: 'Brickwork', date: '2026-06-30', status: 'Pending' },
        { id: 'ms4', title: 'Finishing', date: '2026-09-10', status: 'Pending' },
        { id: 'ms5', title: 'Handover', date: '2026-10-20', status: 'Pending' },
      ],
      tasks: [
        {
          id: 't1',
          title: 'RCC slab casting — Tower A',
          status: 'In Progress',
          assigneeEmployeeId: 'e_suresh',
          dueDate: '2026-04-18',
          priority: 'High',
        },
        {
          id: 't2',
          title: 'Rebar inspection & approval',
          status: 'To Do',
          assigneeEmployeeId: 'e_anil',
          dueDate: '2026-04-14',
          priority: 'Medium',
        },
        {
          id: 't3',
          title: 'Concrete cube test report',
          status: 'Done',
          assigneeEmployeeId: 'e_sunita',
          dueDate: '2026-04-08',
          priority: 'Low',
        },
      ],
      employees: [
        { employeeId: 'e_suresh', daysPresent: 22, attendancePct: 92 },
        { employeeId: 'e_anil', daysPresent: 18, attendancePct: 88 },
      ],
      materials: [
        {
          id: 'mr1',
          materialId: 'm_cement',
          category: 'Cement',
          qtyRequested: 500,
          qtyReceived: 300,
          unit: 'Bags',
          status: 'Partial',
          vendorId: 'v_cement',
        },
      ],
      payments: [
        {
          id: 'pay1',
          date: '2026-03-15',
          type: 'Advance',
          amountRupees: 12_00_000,
          fromTo: 'DLF Ltd → ABC Construction',
          status: 'Received',
        },
        {
          id: 'pay2',
          date: '2026-04-18',
          type: 'Milestone',
          amountRupees: 18_00_000,
          fromTo: 'DLF Ltd → ABC Construction',
          status: 'Pending',
        },
      ],
    },
  } satisfies Record<string, ProjectDetail>,
  employees: employeesData as unknown as Employee[],
  employeeAttendance: {} as Record<string, EmployeeAttendanceMonth[]>,
  employeePayroll: (payrollData as unknown as Array<{
    employeeId: string
    month: string
    workingDays: number
    basicRupees: number
    overtimeRupees: number
    deductionsRupees: number
    netPaidRupees: number
    status: PayrollStatus
  }>).reduce((acc, row) => {
    const list = acc[row.employeeId] ?? []
    list.push({
      month: row.month,
      workingDays: row.workingDays,
      basicRupees: row.basicRupees,
      overtimeRupees: row.overtimeRupees,
      deductionsRupees: row.deductionsRupees,
      netPaidRupees: row.netPaidRupees,
      status: row.status,
    })
    acc[row.employeeId] = list
    return acc
  }, {} as Record<string, EmployeePayrollRow[]>),
  materials: materialsData as unknown as Material[],
  inventoryRequests: [
    {
      id: 'req1',
      date: '2026-04-07',
      requestedByEmployeeId: 'e_suresh',
      projectId: 'p_skyline',
      materialId: 'm_cement',
      qty: 200,
      status: 'Pending',
    },
    {
      id: 'req2',
      date: '2026-04-06',
      requestedByEmployeeId: 'e_anil',
      projectId: 'p_citymall',
      materialId: 'm_sand',
      qty: 80,
      status: 'Approved',
    },
    {
      id: 'req3',
      date: '2026-04-05',
      requestedByEmployeeId: 'e_priya',
      projectId: 'p_skyline',
      materialId: 'm_cable',
      qty: 10,
      status: 'Rejected',
    },
    {
      id: 'req4',
      date: '2026-04-08',
      requestedByEmployeeId: 'e_suresh',
      projectId: 'p_skyline',
      materialId: 'm_tmt',
      qty: 2,
      status: 'Pending',
    },
  ] satisfies InventoryRequest[],
  transactions: (transactionsData as unknown as FinanceTransaction[]).map((t) => ({
    ...t,
    projectId: t.projectId || undefined,
  })),
  invoices: [
    {
      id: 'INV-2025-042',
      clientId: 'c_dlf',
      projectId: 'p_skyline',
      amountRupees: 12_00_000,
      status: 'Paid',
      dueDate: '2026-03-30',
      issuedDate: '2026-03-10',
      lineItems: [
        { description: 'RCC milestone billing', qty: 1, rateRupees: 9_80_000 },
        { description: 'Site mobilization & setup', qty: 1, rateRupees: 2_20_000 },
      ],
    },
    {
      id: 'INV-2025-043',
      clientId: 'c_citymall',
      projectId: 'p_citymall',
      amountRupees: 18_00_000,
      status: 'Pending',
      dueDate: '2026-04-18',
      issuedDate: '2026-04-01',
      lineItems: [
        { description: 'Foundation milestone billing', qty: 1, rateRupees: 14_50_000 },
        { description: 'Testing & quality checks', qty: 1, rateRupees: 3_50_000 },
      ],
    },
    {
      id: 'INV-2025-044',
      clientId: 'c_aurora',
      projectId: 'p_aurora',
      amountRupees: 22_00_000,
      status: 'Overdue',
      dueDate: '2026-03-22',
      issuedDate: '2026-02-28',
      lineItems: [
        { description: 'Structural steel fabrication billing', qty: 1, rateRupees: 18_20_000 },
        { description: 'Transport & handling', qty: 1, rateRupees: 3_80_000 },
      ],
    },
  ] satisfies Invoice[],
  payrollRuns: [
    { id: 'pay_jan', month: 'Jan 2026', processedOn: '2026-02-01', employees: 42, totalPaidLakh: 18.6, status: 'Processed' },
    { id: 'pay_feb', month: 'Feb 2026', processedOn: '2026-03-01', employees: 44, totalPaidLakh: 19.2, status: 'Processed' },
    { id: 'pay_mar', month: 'Mar 2026', processedOn: '2026-04-01', employees: 45, totalPaidLakh: 19.8, status: 'Processed' },
  ] satisfies PayrollRun[],
}

type StoreState = {
  projects: Project[]
  projectDetails: Record<string, ProjectDetail>
  clients: Client[]
  vendors: Vendor[]
  employees: Employee[]
  employeeAttendance: Record<string, EmployeeAttendanceMonth[]>
  employeePayroll: Record<string, EmployeePayrollRow[]>
  materials: Material[]
  inventoryRequests: InventoryRequest[]
  transactions: FinanceTransaction[]
  invoices: Invoice[]
  payrollRuns: PayrollRun[]
}

function normalizeState(s: StoreState): StoreState {
  const projects = Array.isArray(s.projects) ? s.projects : seedState.projects
  const clients = Array.isArray(s.clients) ? s.clients : seedState.clients
  const vendors = Array.isArray(s.vendors) ? s.vendors : seedState.vendors
  const employees = Array.isArray(s.employees) ? s.employees : seedState.employees
  const materials = Array.isArray(s.materials) ? s.materials : seedState.materials
  const inventoryRequests = Array.isArray(s.inventoryRequests)
    ? s.inventoryRequests
    : seedState.inventoryRequests
  const transactions = Array.isArray(s.transactions) ? s.transactions : seedState.transactions
  const invoices = Array.isArray(s.invoices) ? s.invoices : seedState.invoices
  const payrollRuns = Array.isArray(s.payrollRuns) ? s.payrollRuns : seedState.payrollRuns

  const employeeAttendance =
    s.employeeAttendance && typeof s.employeeAttendance === 'object'
      ? s.employeeAttendance
      : seedState.employeeAttendance
  const employeePayroll =
    s.employeePayroll && typeof s.employeePayroll === 'object'
      ? s.employeePayroll
      : seedState.employeePayroll

  const nextDetails: Record<string, ProjectDetail> = {
    ...seedState.projectDetails,
    ...(s.projectDetails ?? {}),
  }

  for (const p of projects ?? []) {
    nextDetails[p.id] = safeProjectDetail(nextDetails[p.id])
  }

  return {
    ...s,
    projects,
    clients,
    vendors,
    employees,
    materials,
    inventoryRequests,
    transactions,
    invoices,
    payrollRuns,
    employeeAttendance,
    employeePayroll,
    projectDetails: nextDetails,
  }
}

const seedState: StoreState = {
  projects: seed.projects,
  projectDetails: seed.projectDetails,
  clients: seed.clients,
  vendors: seed.vendors,
  employees: seed.employees,
  employeeAttendance: seed.employeeAttendance,
  employeePayroll: seed.employeePayroll,
  materials: seed.materials,
  inventoryRequests: seed.inventoryRequests,
  transactions: seed.transactions,
  invoices: seed.invoices,
  payrollRuns: seed.payrollRuns,
}

export function PortalStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return normalizeState(seedState)
      return normalizeState(JSON.parse(raw) as StoreState)
    } catch {
      return normalizeState(seedState)
    }
  })

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  }, [state])

  const store = useMemo<Store>(() => {
    return {
      ...state,
      getProjectDetail: (id: string) => safeProjectDetail(state.projectDetails[id]),
      addProject: (p) => {
        const id = uid('p')
        setState((s) => {
          const managerEmployeeId = s.employees[0]?.id ?? ''
          const detail: ProjectDetail = {
            description: '',
            type: 'Residential',
            managerEmployeeId,
            spentRupees: 0,
            milestones: [
              { id: uid('ms'), title: 'Foundation', date: p.startDate, status: 'Pending' },
              { id: uid('ms'), title: 'Structure', date: p.startDate, status: 'Pending' },
              { id: uid('ms'), title: 'Finishing', date: p.deadline, status: 'Pending' },
              { id: uid('ms'), title: 'Handover', date: p.deadline, status: 'Pending' },
              { id: uid('ms'), title: 'Closeout', date: p.deadline, status: 'Pending' },
            ],
            tasks: [],
            employees: [],
            materials: [],
            payments: [],
          }
          return {
            ...s,
            projects: [{ ...p, id }, ...s.projects],
            projectDetails: { ...s.projectDetails, [id]: detail },
          }
        })
        return id
      },
      updateProject: (id, patch) =>
        setState((s) => ({
          ...s,
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteProject: (id) =>
        setState((s) => {
          const { [id]: _, ...rest } = s.projectDetails
          return {
            ...s,
            projects: s.projects.filter((p) => p.id !== id),
            projectDetails: rest,
          }
        }),
      updateProjectDetail: (id, patch) =>
        setState((s) => ({
          ...s,
          projectDetails: {
            ...s.projectDetails,
            [id]: { ...safeProjectDetail(s.projectDetails[id]), ...patch },
          },
        })),
      addEmployee: (e) =>
        setState((s) => ({ ...s, employees: [{ ...e, id: uid('e') }, ...s.employees] })),
      updateEmployee: (id, patch) =>
        setState((s) => ({
          ...s,
          employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      // employeeAttendance / employeePayroll are edited in page-level flows for now
      addClient: (c) =>
        setState((s) => ({ ...s, clients: [{ ...c, id: uid('c') }, ...s.clients] })),
      updateClient: (id, patch) =>
        setState((s) => ({
          ...s,
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      addVendor: (v) =>
        setState((s) => ({ ...s, vendors: [{ ...v, id: uid('v') }, ...s.vendors] })),
      updateVendor: (id, patch) =>
        setState((s) => ({
          ...s,
          vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      updateMaterial: (id, patch) =>
        setState((s) => ({
          ...s,
          materials: s.materials.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      addMaterial: (m) =>
        setState((s) => ({ ...s, materials: [{ ...m, id: uid('m') }, ...s.materials] })),
      addInventoryRequest: (r) =>
        setState((s) => ({
          ...s,
          inventoryRequests: [{ ...r, id: uid('req') }, ...s.inventoryRequests],
        })),
      updateInventoryRequest: (id, patch) =>
        setState((s) => ({
          ...s,
          inventoryRequests: s.inventoryRequests.map((r) =>
            r.id === id ? { ...r, ...patch } : r,
          ),
        })),
      addTransaction: (t) =>
        setState((s) => ({ ...s, transactions: [{ ...t, id: uid('tx') }, ...s.transactions] })),
      updateTransaction: (id, patch) =>
        setState((s) => ({
          ...s,
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      addInvoice: (inv) =>
        setState((s) => ({ ...s, invoices: [{ ...inv, id: uid('inv') }, ...s.invoices] })),
      updateInvoice: (id, patch) =>
        setState((s) => ({
          ...s,
          invoices: s.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
    }
  }, [state])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function usePortalStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePortalStore must be used within PortalStoreProvider')
  return ctx
}

