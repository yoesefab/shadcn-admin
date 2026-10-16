import {
  Archive,
  BellRing,
  BookOpenCheck,
  CloudUpload,
  FileChartColumn,
  Gauge,
  Logs,
  PackageSearch,
  Settings2,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  teams: [
    {
      name: 'Maarif Analytics',
      logo: BookOpenCheck,
      plan: 'Pilotage commercial',
    },
  ],
  navGroups: [
    {
      title: 'Pilotage',
      items: [
        { title: 'Tableau de bord', url: '/', icon: Gauge },
        { title: 'Produits', url: '/products', icon: PackageSearch },
        { title: 'Inventaire', url: '/inventory', icon: Archive },
        { title: 'Commandes', url: '/orders', icon: ShoppingCart },
      ],
    },
    {
      title: 'Opérations',
      items: [
        { title: 'Imports', url: '/imports', icon: CloudUpload },
        {
          title: 'Alertes de stock',
          url: '/alerts',
          icon: BellRing,
        },
      ],
    },
    {
      title: 'Analyse',
      items: [
        { title: 'Prévisions', url: '/forecasting', icon: TrendingUp },
        { title: 'Rapports', url: '/reports', icon: FileChartColumn },
      ],
    },
    {
      title: 'Gouvernance',
      items: [
        {
          title: 'Settings',
          url: '/administration',
          icon: Settings2,
        },
        { title: 'Logs', url: '/logs', icon: Logs },
        { title: 'Utilisateurs', url: '/users', icon: Users },
      ],
    },
  ],
}
