import { useEffect, useMemo, useState } from 'react'
import { usePortalAuth } from '../auth'
import { Input, PortalButton, PortalCard } from '../ui'
import { usePortalToast } from '../toast'

type Tab = 'company' | 'roles' | 'notifications' | 'profile'
type RoleRow = 'Admin' | 'Manager' | 'Accountant' | 'HR' | 'Site Engineer'
type ModuleCol =
  | 'Dashboard'
  | 'Projects'
  | 'Employees'
  | 'Payroll'
  | 'Inventory'
  | 'Finance'
  | 'Clients'
  | 'Vendors'
  | 'Reports'
  | 'Settings'

const LS_KEY = 'abc_portal_settings_v1'

const DEFAULT_COMPANY = {
  name: 'ABC Construction',
  address: '123 Builder Street',
  city: 'Patna',
  state: 'Bihar',
  pin: '800001',
  gstin: '10AAACB1234F1Z8',
  phone: '+91 98765 43210',
  email: 'info@abcconstruction.in',
  logoDataUrl: '',
}

const DEFAULT_NOTIFS = {
  paymentReceived: true,
  paymentDue: true,
  lowStock: true,
  taskDeadline: true,
  newEmployee: true,
  milestoneReached: true,
  invoiceOverdue: true,
} as const

type NotifKey = keyof typeof DEFAULT_NOTIFS

function buildDefaultMatrix(
  modules: ModuleCol[],
  roles: RoleRow[],
): Record<RoleRow, Record<ModuleCol, boolean>> {
  const base = roles.reduce(
    (acc, r) => {
      acc[r] = modules.reduce(
        (m, c) => {
          m[c] = r === 'Admin'
          return m
        },
        {} as Record<ModuleCol, boolean>,
      )
      return acc
    },
    {} as Record<RoleRow, Record<ModuleCol, boolean>>,
  )
  base.Manager.Projects = true
  base.Manager.Dashboard = true
  base.Manager.Inventory = true
  base.Manager.Clients = true
  base.Manager.Vendors = true
  base.Manager.Reports = true
  base.Accountant.Finance = true
  base.Accountant.Payroll = true
  base.Accountant.Dashboard = true
  base.Accountant.Reports = true
  base.HR.Employees = true
  base.HR.Payroll = true
  base.HR.Dashboard = true
  base['Site Engineer'].Projects = true
  base['Site Engineer'].Inventory = true
  base['Site Engineer'].Dashboard = true
  return base
}

function Toggle({
  on,
  disabled,
  onClick,
}: {
  on: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'h-7 w-12 rounded-full border transition outline-none focus-visible:ring-2 focus-visible:ring-orange-400/50',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-95',
        on ? 'border-orange-400/30 bg-orange-500/20' : 'border-white/10 bg-white/5',
      ].join(' ')}
    >
      <span
        className={[
          'block h-6 w-6 translate-x-0 rounded-full transition',
          on ? 'translate-x-5 bg-orange-400' : 'translate-x-1 bg-white/30',
        ].join(' ')}
      />
    </button>
  )
}

export function SettingsPage() {
  const { user, logout, updateUser } = usePortalAuth()
  const toast = usePortalToast()
  const [tab, setTab] = useState<Tab>('company')

  const [company, setCompany] = useState({ ...DEFAULT_COMPANY })

  const modules: ModuleCol[] = [
    'Dashboard',
    'Projects',
    'Employees',
    'Payroll',
    'Inventory',
    'Finance',
    'Clients',
    'Vendors',
    'Reports',
    'Settings',
  ]
  const roles: RoleRow[] = ['Admin', 'Manager', 'Accountant', 'HR', 'Site Engineer']

  const [matrix, setMatrix] = useState<Record<RoleRow, Record<ModuleCol, boolean>>>(() =>
    buildDefaultMatrix(modules, roles),
  )

  const [notifs, setNotifs] = useState({ ...DEFAULT_NOTIFS })

  const [my, setMy] = useState({
    name: user?.name ?? 'Rajesh Sharma',
    phone: '+91 98765 43210',
    email: user?.email ?? 'rajesh@abcconstruction.in',
    lastLogin: new Date().toLocaleString('en-IN'),
  })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as {
        company?: typeof company
        matrix?: typeof matrix
        notifs?: typeof notifs
        my?: typeof my
      }
      if (parsed.company) setCompany(parsed.company)
      if (parsed.matrix) setMatrix(parsed.matrix)
      if (parsed.notifs) setNotifs(parsed.notifs)
      if (parsed.my) setMy(parsed.my)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ company, matrix, notifs, my }))
  }, [company, matrix, my, notifs])

  const canSaveProfile = useMemo(() => my.name.trim().length >= 2 && my.email.trim().length >= 3, [my.email, my.name])
  const canChangePw = useMemo(() => pw.current.trim().length >= 2 && pw.next.trim().length >= 6 && pw.next === pw.confirm, [pw.confirm, pw.current, pw.next])

  const onLogo = async (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCompany((s) => ({ ...s, logoDataUrl: String(reader.result ?? '') }))
      toast.push({ tone: 'success', title: 'Logo updated' })
    }
    reader.readAsDataURL(file)
  }

  const revertCompanyFromStorage = () => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { company?: typeof company }
        if (parsed.company) {
          setCompany(parsed.company)
          toast.push({ tone: 'info', title: 'Reverted to last saved company profile' })
          return
        }
      } catch {
        // fall through
      }
    }
    setCompany({ ...DEFAULT_COMPANY })
    toast.push({ tone: 'info', title: 'Reset to default company profile' })
  }

  const NOTIF_ROWS: { k: NotifKey; label: string }[] = [
    { k: 'paymentReceived', label: 'Payment received' },
    { k: 'paymentDue', label: 'Payment due reminder' },
    { k: 'lowStock', label: 'Low stock alert' },
    { k: 'taskDeadline', label: 'Task deadline reminder' },
    { k: 'newEmployee', label: 'New employee added' },
    { k: 'milestoneReached', label: 'Project milestone reached' },
    { k: 'invoiceOverdue', label: 'Invoice overdue' },
  ]

  const revertProfileFromStorage = () => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { my?: typeof my }
        if (parsed.my) {
          setMy(parsed.my)
          toast.push({ tone: 'info', title: 'Profile reverted to last saved' })
          return
        }
      } catch {
        // fall through
      }
    }
    setMy({
      name: user?.name ?? 'Rajesh Sharma',
      phone: '+91 98765 43210',
      email: user?.email ?? 'rajesh@abcconstruction.in',
      lastLogin: new Date().toLocaleString('en-IN'),
    })
    toast.push({ tone: 'info', title: 'Profile reset' })
  }

  return (
    <div className="space-y-6">
      <PortalCard>
        <div className="font-heading text-2xl font-extrabold text-white">Settings</div>
        <div className="mt-1 text-sm text-white/60">Company controls, access matrix, alerts, and your profile.</div>
      </PortalCard>

      <PortalCard>
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'company', label: 'Company Profile' },
              { id: 'roles', label: 'Roles & Permissions' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'profile', label: 'My Profile' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
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
      </PortalCard>

      {tab === 'company' && (
        <PortalCard>
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="w-full md:max-w-xs">
              <div className="text-sm font-semibold text-white/60">Logo</div>
              <div className="mt-3 flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                  {company.logoDataUrl ? (
                    <img src={company.logoDataUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-extrabold text-white/50">ABC</span>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onLogo(e.target.files?.[0] ?? null)}
                  />
                  <PortalButton variant="outline">Change</PortalButton>
                </label>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Company Name" value={company.name} onChange={(v) => setCompany((s) => ({ ...s, name: v }))} />
                <Input label="GSTIN" value={company.gstin} onChange={(v) => setCompany((s) => ({ ...s, gstin: v }))} />
                <Input label="Address" value={company.address} onChange={(v) => setCompany((s) => ({ ...s, address: v }))} />
                <Input label="City" value={company.city} onChange={(v) => setCompany((s) => ({ ...s, city: v }))} />
                <Input label="State" value={company.state} onChange={(v) => setCompany((s) => ({ ...s, state: v }))} />
                <Input label="PIN" value={company.pin} onChange={(v) => setCompany((s) => ({ ...s, pin: v }))} />
                <Input label="Phone" value={company.phone} onChange={(v) => setCompany((s) => ({ ...s, phone: v }))} />
                <Input label="Email" value={company.email} onChange={(v) => setCompany((s) => ({ ...s, email: v }))} />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <PortalButton variant="outline" onClick={revertCompanyFromStorage}>
                  Cancel
                </PortalButton>
                <PortalButton
                  onClick={() => toast.push({ tone: 'success', title: 'Company profile saved' })}
                >
                  Save Changes
                </PortalButton>
              </div>
            </div>
          </div>
        </PortalCard>
      )}

      {tab === 'roles' && (
        <PortalCard>
          <div className="font-heading text-lg font-extrabold text-white">Roles × Modules</div>
          <div className="mt-1 text-xs font-semibold text-white/55">
            Admin row is locked ON for all modules.
          </div>
          <div className="mt-5 overflow-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-white/5 text-xs font-bold text-white/60">
                <tr>
                  <th className="px-5 py-3">Role</th>
                  {modules.map((m) => (
                    <th key={m} className="px-5 py-3">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {roles.map((r) => (
                  <tr key={r} className="text-white/80">
                    <td className="px-5 py-4 font-extrabold text-white">{r}</td>
                    {modules.map((m) => (
                      <td key={m} className="px-5 py-4">
                        <Toggle
                          on={matrix[r][m]}
                          disabled={r === 'Admin'}
                          onClick={() =>
                            setMatrix((s) => ({
                              ...s,
                              [r]: { ...s[r], [m]: !s[r][m] },
                            }))
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <PortalButton
              variant="outline"
              onClick={() => {
                setMatrix(buildDefaultMatrix(modules, roles))
                toast.push({ tone: 'warning', title: 'Permissions reset to defaults' })
              }}
            >
              Reset
            </PortalButton>
            <PortalButton onClick={() => toast.push({ tone: 'success', title: 'Permissions saved' })}>
              Save
            </PortalButton>
          </div>
        </PortalCard>
      )}

      {tab === 'notifications' && (
        <PortalCard>
          <div className="font-heading text-lg font-extrabold text-white">Notifications</div>
          <div className="mt-1 text-xs font-semibold text-white/55">Toggle which events trigger alerts.</div>
          <div className="mt-5 grid gap-3">
            {NOTIF_ROWS.map((r) => (
              <div key={r.k} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-white/80">{r.label}</div>
                <Toggle
                  on={notifs[r.k]}
                  onClick={() => setNotifs((s) => ({ ...s, [r.k]: !s[r.k] }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <PortalButton
              variant="outline"
              onClick={() => {
                setNotifs({ ...DEFAULT_NOTIFS })
                toast.push({ tone: 'warning', title: 'Notification defaults restored' })
              }}
            >
              Reset
            </PortalButton>
            <PortalButton onClick={() => toast.push({ tone: 'success', title: 'Notification preferences saved' })}>
              Save
            </PortalButton>
          </div>
        </PortalCard>
      )}

      {tab === 'profile' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <PortalCard>
            <div className="font-heading text-lg font-extrabold text-white">My Profile</div>
            <div className="mt-1 text-xs font-semibold text-white/55">Update your contact information.</div>
            <div className="mt-5 grid gap-4">
              <Input label="Name" value={my.name} onChange={(v) => setMy((s) => ({ ...s, name: v }))} />
              <Input label="Phone" value={my.phone} onChange={(v) => setMy((s) => ({ ...s, phone: v }))} />
              <Input label="Email" value={my.email} onChange={(v) => setMy((s) => ({ ...s, email: v }))} type="email" />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white/55">Last login</div>
                <div className="mt-1 text-sm font-extrabold text-white">{my.lastLogin}</div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <PortalButton variant="outline" onClick={revertProfileFromStorage}>
                Cancel
              </PortalButton>
              <PortalButton
                disabled={!canSaveProfile}
                onClick={() => {
                  updateUser({ name: my.name.trim(), email: my.email.trim() })
                  setMy((s) => ({ ...s, lastLogin: new Date().toLocaleString('en-IN') }))
                  toast.push({ tone: 'success', title: 'Profile saved' })
                }}
              >
                Save
              </PortalButton>
            </div>
          </PortalCard>

          <PortalCard>
            <div className="font-heading text-lg font-extrabold text-white">Change Password</div>
            <div className="mt-1 text-xs font-semibold text-white/55">Demo validation (min 6 chars)</div>
            <div className="mt-5 grid gap-4">
              <Input label="Current" value={pw.current} onChange={(v) => setPw((s) => ({ ...s, current: v }))} type="password" />
              <Input label="New" value={pw.next} onChange={(v) => setPw((s) => ({ ...s, next: v }))} type="password" />
              <Input label="Confirm" value={pw.confirm} onChange={(v) => setPw((s) => ({ ...s, confirm: v }))} type="password" />
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <PortalButton variant="outline" onClick={() => setPw({ current: '', next: '', confirm: '' })}>
                Reset
              </PortalButton>
              <PortalButton
                disabled={!canChangePw}
                onClick={() => {
                  setPw({ current: '', next: '', confirm: '' })
                  toast.push({ tone: 'success', title: 'Password updated (demo)' })
                }}
              >
                Save
              </PortalButton>
            </div>
          </PortalCard>
        </div>
      )}

      <PortalCard className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-white">Logout</div>
          <div className="mt-1 text-xs font-semibold text-white/55">Signed in as {user?.name ?? 'User'}.</div>
        </div>
        <PortalButton variant="outline" onClick={logout}>
          Logout
        </PortalButton>
      </PortalCard>
    </div>
  )
}

