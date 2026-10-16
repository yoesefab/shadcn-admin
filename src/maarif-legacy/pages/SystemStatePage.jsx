import { useEffect, useId, useState } from 'react'
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowClockwise,
  ArrowRight,
  ArrowUp,
  Bell,
  Books,
  BookOpen,
  CalendarBlank,
  CaretDown,
  ChartBar,
  ChartLineUp,
  CheckCircle,
  CircleNotch,
  CloudArrowUp,
  Cube,
  CurrencyDollar,
  DownloadSimple,
  FileText,
  FileCsv,
  FloppyDisk,
  GearSix,
  Eye,
  List,
  MapPin,
  MagnifyingGlass,
  Key,
  PencilSimple,
  Plus,
  Prohibit,
  ShoppingBagOpen,
  ShoppingCart,
  Shield,
  SignOut,
  TrendUp,
  Truck,
  User,
  UserPlus,
  Users,
  Warning,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function SystemStatePage({ onNavigate, type }) {
  const unauthorized = type === 'unauthorized'
  const Icon = unauthorized ? Prohibit : MagnifyingGlass

  return (
    <section
      aria-labelledby={`${type}-title`}
      className={`system-state-page system-state-page--${type}`}
    >
      <div aria-hidden='true' className='system-state-icon'>
        <Icon weight='regular' />
      </div>
      <p className='system-state-code'>Erreur {unauthorized ? '403' : '404'}</p>
      <h2 id={`${type}-title`}>
        {unauthorized ? 'Accès non autorisé' : 'Page introuvable'}
      </h2>
      <p className='system-state-description'>
        {unauthorized
          ? 'Votre compte ne dispose pas des autorisations nécessaires pour consulter cette page.'
          : 'La page demandée n’existe pas ou son adresse a peut-être changé.'}
      </p>
      <button
        className='catalog-primary-button system-state-action'
        onClick={onNavigate}
        type='button'
      >
        <ArrowLeft aria-hidden='true' />
        {unauthorized
          ? 'Retourner au catalogue'
          : 'Retourner au tableau de bord'}
      </button>
    </section>
  )
}
