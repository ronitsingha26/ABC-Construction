import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  HardHat,
  Package,
  Settings,
  Users,
  Wallet,
} from 'lucide-react'
import type { PortalRole } from './auth'

export type PortalNavItem = {
  label: string
  to: string
  Icon: typeof HardHat
  roles: PortalRole[]
}

export const portalNav: PortalNavItem[] = [
  {
    label: 'Dashboard',
    to: '/portal/dashboard',
    Icon: Activity,
    roles: ['Owner', 'Project Manager', 'Site Engineer', 'Accounts', 'HR'],
  },
  {
    label: 'Projects',
    to: '/portal/projects',
    Icon: HardHat,
    roles: ['Owner', 'Project Manager', 'Site Engineer'],
  },
  {
    label: 'Employees',
    to: '/portal/employees',
    Icon: Users,
    roles: ['Owner', 'HR', 'Project Manager'],
  },
  {
    label: 'Payroll',
    to: '/portal/payroll',
    Icon: Wallet,
    roles: ['Owner', 'Accounts', 'HR'],
  },
  {
    label: 'Inventory',
    to: '/portal/inventory',
    Icon: Package,
    roles: ['Owner', 'Project Manager', 'Site Engineer'],
  },
  {
    label: 'Finance',
    to: '/portal/finance',
    Icon: CreditCard,
    roles: ['Owner', 'Accounts'],
  },
  {
    label: 'Clients',
    to: '/portal/clients',
    Icon: BriefcaseBusiness,
    roles: ['Owner', 'Project Manager', 'Accounts'],
  },
  {
    label: 'Vendors',
    to: '/portal/vendors',
    Icon: Building2,
    roles: ['Owner', 'Project Manager', 'Accounts'],
  },
  {
    label: 'Reports',
    to: '/portal/reports',
    Icon: BarChart3,
    roles: ['Owner', 'Project Manager', 'Accounts'],
  },
  {
    label: 'Settings',
    to: '/portal/settings',
    Icon: Settings,
    roles: ['Owner', 'Project Manager', 'Site Engineer', 'Accounts', 'HR'],
  },
]

