import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RecordsTable } from '@/features/maarif/records-table'
import { StatusBadge } from '@/features/maarif/status-badge'
import { TablePageHeading } from '@/features/maarif/table-page'
import { formatMad } from '../shared/catalogData.js'

function businessDateDaysAgo(days) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Casablanca',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value])
  )
  const date = new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
  )
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

export function OrdersManagement({ onView, orders }) {
  const [dateRange, setDateRange] = useState('all')
  const filtered = orders.filter((order) => {
    if (dateRange === 'all') return true
    const days = dateRange === '7' ? 6 : 29
    return order.isoDate >= businessDateDaysAgo(days)
  })
  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <TablePageHeading
        title='Commandes'
        description='Consultez les ventes et suivez les commandes.'
      />
      <RecordsTable
        key={dateRange}
        searchAccessory={
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger
              aria-label='Filtrer par période'
              className='h-8 w-48'
              size='sm'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Toutes les dates</SelectItem>
              <SelectItem value='7'>7 derniers jours</SelectItem>
              <SelectItem value='30'>30 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        }
        label='Liste des commandes'
        bulkSelection={{
          entityName: 'commande',
          entityGender: 'feminine',
          exportFileName: 'commandes-selection.csv',
        }}
        data={filtered}
        rowId={(row) => row.reference}
        searchPlaceholder='Rechercher une référence ou une ville…'
        fields={[
          {
            key: 'reference',
            label: 'Référence',
            render: (row) => (
              <span className='font-medium'>{row.reference}</span>
            ),
          },
          {
            key: 'date',
            label: 'Date',
            value: (row) => row.isoDate,
            render: (row) => <time dateTime={row.isoDate}>{row.date}</time>,
          },
          {
            key: 'status',
            label: 'Statut',
            filter: true,
            render: (row) => <StatusBadge status={row.status} />,
          },
          { key: 'source', label: 'Source', filter: true },
          { key: 'city', label: 'Ville' },
          { key: 'itemCount', label: 'Articles' },
          {
            key: 'total',
            label: 'Total',
            render: (row) => formatMad(row.total),
          },
        ]}
        actions={(row) => [
          { label: 'Voir la commande', onClick: () => onView(row) },
        ]}
      />
    </div>
  )
}
