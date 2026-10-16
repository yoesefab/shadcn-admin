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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { RecordsTable } from '@/features/maarif/records-table'
import { StatusBadge } from '@/features/maarif/status-badge'
import { frenchDateOrder } from '@/features/maarif/table-format'
import { TablePageHeading, TableFeedback } from '@/features/maarif/table-page'

function ImportHistoryStatus({ status }) {
  const tone =
    status === 'Terminé'
      ? 'success'
      : status === 'Terminé avec erreurs'
        ? 'warning'
        : status === 'Échec'
          ? 'error'
          : 'neutral'
  return (
    <span className={`import-history-status import-history-status--${tone}`}>
      {status === 'Terminé' ? (
        <CheckCircle aria-hidden='true' weight='fill' />
      ) : status === 'Annulé' ? (
        <Prohibit aria-hidden='true' />
      ) : (
        <WarningCircle aria-hidden='true' weight='fill' />
      )}
      {status}
    </span>
  )
}

function ImportHistoryDialog({ item, onClose, onDownloadErrors }) {
  const errors = item.errors ?? []
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className='max-h-[90svh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='break-all'>{item.fileName}</DialogTitle>
          <DialogDescription>
            {item.id} · {item.successfulRows} lignes réussies sur{' '}
            {item.totalRows}
          </DialogDescription>
        </DialogHeader>
        <StatusBadge status={item.status} />
        <dl className='grid gap-4 text-sm sm:grid-cols-2'>
          {[
            ['Empreinte du fichier', item.checksum],
            ['Début', item.startTime],
            ['Fin', item.completionTime],
            ['Lignes totales', item.totalRows],
            ['Lignes en échec', item.failedRows],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className='text-muted-foreground'>{label}</dt>
              <dd className='font-medium break-all'>{value}</dd>
            </div>
          ))}
        </dl>
        <section
          aria-labelledby='import-error-list-title'
          className='min-w-0 space-y-4'
        >
          <div>
            <h3 id='import-error-list-title' className='font-semibold'>
              Erreurs de l’import
            </h3>
            <p className='text-sm text-muted-foreground'>
              {item.failedRows
                ? `${errors.length} erreurs affichées pour ${item.failedRows} lignes rejetées`
                : 'Aucune erreur enregistrée'}
            </p>
          </div>
          {errors.length ? (
            <RecordsTable
              label='Erreurs de l’import'
              data={errors.map((error) => ({
                line: error.rowNumber,
                column: error.field,
                message: error.message,
              }))}
              rowId={(row) => `${row.line}-${row.column}`}
              selectable={false}
              fields={[
                { key: 'line', label: 'Ligne' },
                {
                  key: 'column',
                  label: 'Colonne',
                  filter: true,
                  render: (row) => <code>{row.column}</code>,
                },
                {
                  key: 'message',
                  label: 'Erreur',
                  render: (row) => (
                    <span className='block max-w-md whitespace-normal'>
                      {row.message}
                    </span>
                  ),
                },
              ]}
            />
          ) : (
            <p className='text-sm'>
              {item.failedRows
                ? 'Le détail des erreurs n’est pas disponible dans cette liste.'
                : 'Ce fichier ne contient aucune ligne rejetée.'}
            </p>
          )}
        </section>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Fermer
          </Button>
          {!!item.failedRows && onDownloadErrors && (
            <Button onClick={() => onDownloadErrors(item)}>
              Télécharger le rapport d’erreurs
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ImportHistoryPage({ imports, onDownloadErrors }) {
  const [selectedImport, setSelectedImport] = useState(null)
  const [downloadError, setDownloadError] = useState('')
  const downloadErrors = async (item) => {
    setDownloadError('')
    try {
      await onDownloadErrors(item)
    } catch {
      setDownloadError('Impossible de télécharger le rapport d’erreurs.')
    }
  }
  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <TablePageHeading
        title='Historique des imports'
        description='Consultez les traitements, les volumes et les rejets de chaque fichier.'
      />
      {downloadError ? <p role='alert'>{downloadError}</p> : null}
      <RecordsTable
        label='Historique des imports'
        data={imports}
        rowId={(row) => row.id}
        searchPlaceholder='Rechercher un fichier ou un import…'
        fields={[
          {
            key: 'fileName',
            label: 'Fichier',
            render: (row) => (
              <span className='font-medium'>{row.fileName}</span>
            ),
          },
          { key: 'id', label: 'Import', hidden: true },
          {
            key: 'checksum',
            label: 'Empreinte',
            hidden: true,
            render: (row) => (
              <code title={row.checksum}>
                {row.checksum.slice(0, 8)}…{row.checksum.slice(-4)}
              </code>
            ),
          },
          {
            key: 'status',
            label: 'Statut',
            filter: true,
            render: (row) => <StatusBadge status={row.status} />,
          },
          { key: 'totalRows', label: 'Total' },
          { key: 'successfulRows', label: 'Réussies' },
          {
            key: 'failedRows',
            label: 'Échecs',
            render: (row) => (
              <span className={row.failedRows ? 'text-destructive' : ''}>
                {row.failedRows}
              </span>
            ),
          },
          {
            key: 'startTime',
            label: 'Début',
            value: (row) => frenchDateOrder(row.startTime),
            render: (row) => row.startTime,
          },
          {
            key: 'completionTime',
            label: 'Fin',
            value: (row) => frenchDateOrder(row.completionTime),
            render: (row) => row.completionTime,
            hidden: true,
          },
        ]}
        actions={(item) => [
          { label: 'Ouvrir l’import', onClick: () => setSelectedImport(item) },
          ...(item.failedRows && onDownloadErrors
            ? [
                {
                  label: 'Télécharger les erreurs',
                  onClick: () => downloadErrors(item),
                },
              ]
            : []),
        ]}
      />
      {selectedImport && (
        <ImportHistoryDialog
          item={selectedImport}
          onClose={() => setSelectedImport(null)}
          onDownloadErrors={onDownloadErrors ? downloadErrors : undefined}
        />
      )}
    </div>
  )
}
