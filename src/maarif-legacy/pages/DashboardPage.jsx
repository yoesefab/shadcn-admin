import { motion, useReducedMotion } from 'framer-motion'
import {
  Archive,
  BookOpen,
  CircleOff,
  DollarSign,
  ShoppingCart,
  TriangleAlert,
} from 'lucide-react'
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
import { dashboardItemVariants, getMotionState } from '@/lib/motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const KPI_DATA = [
  {
    label: 'Chiffre d’affaires',
    value: '284 650',
    suffix: 'MAD',
    delta: '18,6 %',
    comparison: 'vs 01–27 juil. 2026',
    icon: DollarSign,
  },
  {
    label: 'Commandes',
    value: '1 248',
    delta: '12,3 %',
    comparison: 'vs 01–27 juil. 2026',
    icon: ShoppingCart,
  },
  {
    label: 'Exemplaires vendus',
    value: '2 914',
    delta: '14,8 %',
    comparison: 'vs 01–27 juil. 2026',
    icon: BookOpen,
  },
  {
    label: 'Stock actuel',
    value: '18 642',
    delta: '—',
    comparison: 'vs 27 juil. 2026',
    icon: Archive,
  },
  {
    label: 'Produits en stock faible',
    value: '27',
    delta: '8',
    comparison: 'vs 27 juil. 2026',
    icon: TriangleAlert,
  },
  {
    label: 'Produits en rupture',
    value: '6',
    delta: '2',
    comparison: 'vs 27 juil. 2026',
    icon: CircleOff,
  },
]

const TREND_DATA = [
  { date: 'sept.', revenue: 9, orders: 37 },
  { date: 'oct.', revenue: 23, orders: 57 },
  { date: 'nov.', revenue: 28, orders: 52 },
  { date: 'déc.', revenue: 22, orders: 48 },
  { date: 'janv.', revenue: 45, orders: 63 },
  { date: 'févr.', revenue: 38, orders: 51 },
  { date: 'mars', revenue: 52, orders: 59 },
  { date: 'avr.', revenue: 27, orders: 46 },
  { date: 'mai', revenue: 58, orders: 70 },
  { date: 'juin', revenue: 63, orders: 79 },
  { date: 'juil.', revenue: 46, orders: 61 },
  { date: 'août', revenue: 57, orders: 118 },
]

const CATEGORY_DATA = [
  { name: 'Roman', value: 1342, percentage: '46,0 %', color: 'var(--chart-1)' },
  {
    name: 'Jeunesse',
    value: 876,
    percentage: '30,1 %',
    color: 'var(--chart-2)',
  },
  {
    name: 'Scolaire',
    value: 476,
    percentage: '16,3 %',
    color: 'var(--chart-3)',
  },
  { name: 'Essai', value: 220, percentage: '7,6 %', color: 'var(--chart-4)' },
]

const LANGUAGE_DATA = [
  {
    name: 'Français',
    value: 1823,
    percentage: '62,6 %',
    color: 'var(--chart-1)',
  },
  { name: 'Arabe', value: 756, percentage: '25,9 %', color: 'var(--chart-2)' },
  {
    name: 'Anglais',
    value: 335,
    percentage: '11,5 %',
    color: 'var(--chart-3)',
  },
]

function KpiCard({ item }) {
  const Icon = item.icon
  return (
    <Card className='h-full gap-3 py-4'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 px-4 pb-0'>
        <CardTitle className='text-sm font-medium'>{item.label}</CardTitle>
        <Icon
          aria-hidden='true'
          className='h-4 w-4 shrink-0 text-muted-foreground'
        />
      </CardHeader>
      <CardContent className='flex flex-1 flex-col px-4'>
        <div className='text-xl font-bold'>
          {item.value}
          {item.suffix ? ` ${item.suffix}` : ''}
        </div>
        <p className='mt-auto pt-2 text-xs text-muted-foreground'>
          {item.delta !== '—' ? '+' : ''}
          {item.delta} {item.comparison}
        </p>
      </CardContent>
    </Card>
  )
}

function DashboardItem({ children, className, index, reduceMotion }) {
  return (
    <motion.div
      className={className}
      custom={reduceMotion ? 0 : index * 0.045}
      variants={dashboardItemVariants}
      {...getMotionState(reduceMotion)}
    >
      {children}
    </motion.div>
  )
}

function TrendChart({ data = TREND_DATA, dataKey, label, tickFormatter }) {
  return (
    <div aria-label={label} className='h-[240px] min-w-0' role='img'>
      <ResponsiveContainer height='100%' minWidth={0} width='100%'>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
        >
          <CartesianGrid stroke='var(--border)' vertical={false} />
          <XAxis
            axisLine={false}
            dataKey='date'
            interval={0}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={dataKey === 'revenue'}
            axisLine={false}
            domain={[
              0,
              (dataMax) => Math.max(1, Math.ceil(Number(dataMax) * 1.15)),
            ]}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={tickFormatter}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              boxShadow: 'none',
              color: 'var(--popover-foreground)',
              fontSize: 12,
            }}
            formatter={(value) => [
              dataKey === 'revenue' ? `${value} 000 MAD` : value,
              label,
            ]}
            labelStyle={{ color: 'var(--popover-foreground)', fontWeight: 700 }}
          />
          <Line
            activeDot={{ r: 4 }}
            dataKey={dataKey}
            dot={{ r: 2.5 }}
            isAnimationActive={false}
            stroke='var(--chart-1)'
            strokeWidth={2}
            type='linear'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function DistributionPanel({ title, data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  return (
    <Card className='min-w-0 gap-4 py-4'>
      <CardHeader className='px-4'>
        <CardTitle className='text-sm'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-center gap-4 px-4 sm:flex-row'>
        <div
          aria-label={title}
          className='h-[160px] w-[160px] shrink-0'
          role='img'
        >
          <ResponsiveContainer height='100%' minWidth={0} width='100%'>
            <PieChart>
              <Pie
                cx='50%'
                cy='50%'
                data={data}
                dataKey='value'
                innerRadius='58%'
                isAnimationActive={false}
                outerRadius='92%'
                paddingAngle={1}
                stroke='var(--card)'
                strokeWidth={1}
              >
                {data.map((item) => (
                  <Cell fill={item.color} key={item.name} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='w-full min-w-0 space-y-2'>
          {data.map((item) => (
            <div
              className='grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-sm'
              key={item.name}
            >
              <span className='flex items-center gap-2'>
                <i
                  className='size-2 shrink-0 rounded-full'
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className='text-muted-foreground tabular-nums'>
                {item.value.toLocaleString('fr-FR')}
              </span>
              <strong>{item.percentage}</strong>
            </div>
          ))}
          <div className='grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 border-t pt-2 text-sm font-medium'>
            <span>Total</span>
            <strong>{total.toLocaleString('fr-FR')}</strong>
            <strong>100 %</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardContent(props) {
  const reduceMotion = useReducedMotion()
  const dashboard = props?.dashboard
  const number = (value) =>
    Number(value ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
  const kpis = dashboard
    ? [
        { ...KPI_DATA[0], value: number(dashboard.totalRevenue), delta: '—' },
        { ...KPI_DATA[1], value: number(dashboard.numberOfOrders), delta: '—' },
        { ...KPI_DATA[2], value: number(dashboard.unitsSold), delta: '—' },
        {
          ...KPI_DATA[3],
          value: number(dashboard.currentStockQuantity),
          delta: '—',
        },
        {
          ...KPI_DATA[4],
          value: number(dashboard.lowStockProducts),
          delta: '—',
        },
        {
          ...KPI_DATA[5],
          value: number(dashboard.outOfStockProducts),
          delta: '—',
        },
      ]
    : KPI_DATA
  const monthlyTrend = new Map()
  dashboard?.revenueTrend?.forEach((item) => {
    const month = item.date.slice(0, 7)
    const current = monthlyTrend.get(month) ?? { revenue: 0, orders: 0 }
    monthlyTrend.set(month, {
      revenue: current.revenue + Number(item.revenue) / 1000,
      orders: current.orders + item.orders,
    })
  })
  const trend = dashboard
    ? Array.from(monthlyTrend, ([month, values]) => ({
        date: new Intl.DateTimeFormat('fr-MA', {
          month: 'short',
          timeZone: 'Africa/Casablanca',
        }).format(new Date(`${month}-01T12:00:00Z`)),
        ...values,
      }))
    : TREND_DATA
  const distribution = (items, fallback) => {
    if (!items) return fallback
    const total = items.reduce((sum, item) => sum + Number(item.value), 0)
    return items.map((item, index) => ({
      name: item.label,
      value: Number(item.value),
      percentage: total
        ? `${((Number(item.value) / total) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`
        : '0 %',
      color: `var(--chart-${(index % 5) + 1})`,
    }))
  }
  const categoryData = distribution(dashboard?.salesByCategory, CATEGORY_DATA)
  const languageData = distribution(dashboard?.salesByLanguage, LANGUAGE_DATA)
  return (
    <div className='space-y-4'>
      <section
        aria-label='Indicateurs clés'
        className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6'
      >
        {kpis.map((item, index) => (
          <DashboardItem
            index={index}
            key={item.label}
            reduceMotion={reduceMotion}
          >
            <KpiCard item={item} />
          </DashboardItem>
        ))}
      </section>

      <section
        aria-label='Tendances'
        className='grid grid-cols-1 gap-4 lg:grid-cols-2'
      >
        <DashboardItem
          className='min-w-0'
          index={6}
          reduceMotion={reduceMotion}
        >
          <Card className='h-full min-w-0 gap-4 py-4'>
            <CardHeader className='px-4'>
              <CardTitle className='text-sm'>
                Évolution du chiffre d’affaires (MAD)
              </CardTitle>
            </CardHeader>
            <CardContent className='ps-2 pe-4'>
              <TrendChart
                data={trend}
                dataKey='revenue'
                label='Chiffre d’affaires'
                tickFormatter={(value) => `${value}k`}
              />
            </CardContent>
          </Card>
        </DashboardItem>
        <DashboardItem
          className='min-w-0'
          index={7}
          reduceMotion={reduceMotion}
        >
          <Card className='h-full min-w-0 gap-4 py-4'>
            <CardHeader className='px-4'>
              <CardTitle className='text-sm'>Évolution des commandes</CardTitle>
            </CardHeader>
            <CardContent className='ps-2 pe-4'>
              <TrendChart
                data={trend}
                dataKey='orders'
                label='Commandes'
                tickFormatter={(value) => value}
              />
            </CardContent>
          </Card>
        </DashboardItem>
      </section>

      <section
        aria-label='Répartition des ventes'
        className='grid grid-cols-1 gap-4 lg:grid-cols-2'
      >
        <DashboardItem
          className='min-w-0'
          index={8}
          reduceMotion={reduceMotion}
        >
          <DistributionPanel
            data={categoryData}
            title='Ventes par catégorie (exemplaires)'
          />
        </DashboardItem>
        <DashboardItem
          className='min-w-0'
          index={9}
          reduceMotion={reduceMotion}
        >
          <DistributionPanel
            data={languageData}
            title='Ventes par langue (exemplaires)'
          />
        </DashboardItem>
      </section>
    </div>
  )
}
