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
import { ProductImage } from '@/features/maarif/product-image'
import { RecordsTable } from '@/features/maarif/records-table'
import { StatusBadge } from '@/features/maarif/status-badge'
import { frenchDateOrder } from '@/features/maarif/table-format'
import { TablePageHeading, TableFeedback } from '@/features/maarif/table-page'

const STOCK_ALERTS = [
  {
    id: 'ALT-2026-0038',
    product: 'Les Misérables — Tome I',
    sku: 'LIV-000619',
    type: 'Rupture de stock',
    severity: 'Critique',
    explanation: 'Le stock est à 0 exemplaire, sous le seuil minimum de 5.',
    suggestedAction: 'Commander 20 exemplaires auprès de Sodis Maroc.',
    createdAt: '27 août 2026 à 18:42',
    status: 'Nouvelle',
  },
  {
    id: 'ALT-2026-0037',
    product: 'Antigone',
    sku: 'LIV-000538',
    type: 'Stock faible',
    severity: 'Élevée',
    explanation:
      '5 exemplaires restent en stock pour un seuil minimum fixé à 8.',
    suggestedAction: 'Réceptionner REC-2026-0321 ou commander 12 exemplaires.',
    createdAt: '27 août 2026 à 17:08',
    status: 'Nouvelle',
  },
  {
    id: 'ALT-2026-0036',
    product: 'Le Petit Prince',
    sku: 'LIV-000812',
    type: 'Risque de rupture',
    severity: 'Élevée',
    explanation:
      'La prévision indique une rupture dans 4 jours au rythme actuel.',
    suggestedAction: 'Commander 18 exemplaires avant le 29 août 2026.',
    createdAt: '27 août 2026 à 09:30',
    status: 'Acquittée',
  },
  {
    id: 'ALT-2026-0035',
    product: 'L’Enfant de sable',
    sku: 'LIV-000947',
    type: 'Stock faible',
    severity: 'Moyenne',
    explanation:
      '7 exemplaires restent en stock pour un seuil minimum fixé à 9.',
    suggestedAction: 'Vérifier les ventes prévues avant le prochain réassort.',
    createdAt: '26 août 2026 à 16:24',
    status: 'Nouvelle',
  },
  {
    id: 'ALT-2026-0034',
    product: 'موسم الهجرة إلى الشمال',
    sku: 'LIV-001026',
    type: 'Risque de rupture',
    severity: 'Moyenne',
    explanation:
      'Le stock couvrira environ 8 jours de ventes au rythme actuel.',
    suggestedAction:
      'Ajouter 10 exemplaires à la prochaine commande fournisseur.',
    createdAt: '26 août 2026 à 11:16',
    status: 'Acquittée',
  },
  {
    id: 'ALT-2026-0033',
    product: 'La Civilisation, ma Mère !...',
    sku: 'LIV-001104',
    type: 'Stock faible',
    severity: 'Élevée',
    explanation:
      '3 exemplaires restent en stock pour un seuil minimum fixé à 6.',
    suggestedAction:
      'Commander 15 exemplaires auprès de Distribution Livre Maroc.',
    createdAt: '25 août 2026 à 15:52',
    status: 'Nouvelle',
  },
  {
    id: 'ALT-2026-0032',
    product: 'Ainsi parlait Zarathoustra',
    sku: 'LIV-001233',
    type: 'Risque de rupture',
    severity: 'Moyenne',
    explanation:
      'Une hausse des ventes réduit la couverture de stock à 10 jours.',
    suggestedAction:
      'Surveiller les ventes pendant 3 jours avant réapprovisionnement.',
    createdAt: '24 août 2026 à 14:40',
    status: 'Résolue',
  },
  {
    id: 'ALT-2026-0031',
    product: 'Harry Potter à l’école des sorciers',
    sku: 'LIV-001315',
    type: 'Stock faible',
    severity: 'Moyenne',
    explanation:
      '9 exemplaires restent en stock pour un seuil minimum fixé à 10.',
    suggestedAction: 'Inclure 12 exemplaires dans la prochaine commande.',
    createdAt: '23 août 2026 à 10:05',
    status: 'Acquittée',
  },
  {
    id: 'ALT-2026-0030',
    product: 'ذاكرة الجسد',
    sku: 'LIV-001408',
    type: 'Rupture de stock',
    severity: 'Critique',
    explanation:
      'Le stock était épuisé alors que 6 commandes étaient en attente.',
    suggestedAction: 'Réception fournisseur effectuée et commandes libérées.',
    createdAt: '22 août 2026 à 13:18',
    status: 'Résolue',
  },
]

function StockAlertSeverity({ severity }) {
  const tone =
    severity === 'Critique'
      ? 'critical'
      : severity === 'Élevée'
        ? 'high'
        : 'medium'
  return (
    <span className={`stock-alert-severity stock-alert-severity--${tone}`}>
      <WarningCircle aria-hidden='true' weight='fill' />
      {severity}
    </span>
  )
}

function StockAlertStatus({ status }) {
  const tone =
    status === 'Nouvelle'
      ? 'new'
      : status === 'Acquittée'
        ? 'acknowledged'
        : 'resolved'
  return (
    <span className={`stock-alert-status stock-alert-status--${tone}`}>
      {status === 'Résolue' ? (
        <CheckCircle aria-hidden='true' weight='fill' />
      ) : (
        <Bell
          aria-hidden='true'
          weight={status === 'Nouvelle' ? 'fill' : 'regular'}
        />
      )}
      {status}
    </span>
  )
}

function StockAlertConfirmDialog({ alert, mode, onCancel, onConfirm }) {
  const [isSaving, setIsSaving] = useState(false)
  const isResolve = mode === 'resolve'

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !isSaving) onCancel()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isSaving, onCancel])

  const confirm = () => {
    setIsSaving(true)
    window.setTimeout(onConfirm, 620)
  }

  return (
    <div
      className='catalog-modal-backdrop'
      onMouseDown={(event) =>
        event.target === event.currentTarget && !isSaving && onCancel()
      }
    >
      <section
        aria-labelledby='stock-alert-confirm-title'
        aria-modal='true'
        className='catalog-modal catalog-confirm-modal stock-alert-confirm-modal'
        role='alertdialog'
      >
        <span
          className={`catalog-confirm-icon${isResolve ? ' stock-alert-confirm-icon--resolve' : ''}`}
        >
          {isResolve ? (
            <CheckCircle aria-hidden='true' />
          ) : (
            <Bell aria-hidden='true' />
          )}
        </span>
        <div>
          <p>
            {alert.id} · {alert.sku}
          </p>
          <h2 id='stock-alert-confirm-title'>
            {isResolve ? 'Résoudre cette alerte ?' : 'Acquitter cette alerte ?'}
          </h2>
          <p>
            {isResolve ? (
              <>
                L’alerte concernant <strong>{alert.product}</strong> sera
                marquée comme résolue. Cette action ne modifie pas le stock.
              </>
            ) : (
              <>
                Vous confirmez avoir pris connaissance de l’alerte concernant{' '}
                <strong>{alert.product}</strong>. Elle restera ouverte jusqu’à
                sa résolution.
              </>
            )}
          </p>
        </div>
        <footer>
          <button
            className='catalog-secondary-button'
            disabled={isSaving}
            onClick={onCancel}
            type='button'
          >
            Annuler
          </button>
          <button
            className='catalog-primary-button'
            disabled={isSaving}
            onClick={confirm}
            type='button'
          >
            {isSaving ? (
              <>
                <CircleNotch aria-hidden='true' className='spinner' />
                Enregistrement…
              </>
            ) : isResolve ? (
              <>
                <CheckCircle aria-hidden='true' />
                Résoudre l’alerte
              </>
            ) : (
              <>
                <Bell aria-hidden='true' />
                Acquitter l’alerte
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  )
}

export function StockAlertsPage({ alertData, onUpdate }) {
  const [alerts, setAlerts] = useState(alertData ?? STOCK_ALERTS)
  const [dialog, setDialog] = useState(null)
  const [feedback, setFeedback] = useState('')
  useEffect(() => {
    if (alertData) setAlerts(alertData)
  }, [alertData])
  const updateSelectedAlerts = async (selected, nextStatus) => {
    await onUpdate?.(selected, nextStatus)
    const ids = new Set(selected.map((alert) => alert.id))
    setAlerts((current) =>
      current.map((alert) =>
        ids.has(alert.id) ? { ...alert, status: nextStatus } : alert
      )
    )
    setFeedback(
      `${selected.length} alerte(s) ${nextStatus === 'Résolue' ? 'résolue(s)' : 'acquittée(s)'} avec succès.`
    )
  }
  const confirmAction = async () => {
    const nextStatus = dialog.mode === 'resolve' ? 'Résolue' : 'Acquittée'
    await onUpdate?.([dialog.alert], nextStatus)
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === dialog.alert.id ? { ...alert, status: nextStatus } : alert
      )
    )
    setFeedback(
      'Alerte ' +
        dialog.alert.id +
        ' ' +
        nextStatus.toLocaleLowerCase('fr') +
        ' avec succès.'
    )
    setDialog(null)
  }
  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <TablePageHeading
        title='Alertes de stock'
        description='Priorisez et traitez les alertes de votre catalogue.'
      />
      <TableFeedback message={feedback} onDismiss={() => setFeedback('')} />
      <RecordsTable
        label='Alertes de stock'
        bulkSelection={{
          entityName: 'alerte',
          entityGender: 'feminine',
          exportFileName: 'alertes-selection.csv',
          actions: [
            {
              label: 'Acquitter les alertes sélectionnées',
              icon: <Bell />,
              description:
                'Seules les nouvelles alertes sélectionnées seront acquittées. Elles resteront ouvertes jusqu’à leur résolution. Le stock ne sera pas modifié.',
              eligible: (alert) => alert.status === 'Nouvelle',
              onConfirm: (selected) =>
                updateSelectedAlerts(selected, 'Acquittée'),
            },
            {
              label: 'Résoudre les alertes sélectionnées',
              icon: <CheckCircle />,
              description:
                'Les alertes sélectionnées encore ouvertes seront marquées comme résolues. Cette action ne modifie pas le stock.',
              eligible: (alert) => alert.status !== 'Résolue',
              onConfirm: (selected) =>
                updateSelectedAlerts(selected, 'Résolue'),
            },
          ],
        }}
        data={alerts}
        rowId={(row) => row.id}
        rowLabel={(row) => row.id}
        searchPlaceholder='Rechercher un produit ou une alerte…'
        fields={[
          { key: 'id', label: 'Alerte' },
          {
            key: 'product',
            label: 'Produit',
            filter: true,
            render: (row) => (
              <div className='flex items-center gap-2'>
                <ProductImage title={row.product} imageUrl={row.imageUrl} />
                <span className='font-medium'>{row.product}</span>
              </div>
            ),
          },
          { key: 'sku', label: 'SKU', hidden: true },
          { key: 'type', label: 'Type', filter: true },
          {
            key: 'severity',
            label: 'Sévérité',
            filter: true,
            render: (row) => <StatusBadge status={row.severity} />,
          },
          {
            key: 'explanation',
            label: 'Explication',
            render: (row) => (
              <p className='w-56 whitespace-normal'>{row.explanation}</p>
            ),
          },
          {
            key: 'suggestedAction',
            label: 'Action suggérée',
            render: (row) => (
              <p className='w-56 whitespace-normal'>{row.suggestedAction}</p>
            ),
          },
          {
            key: 'createdAt',
            label: 'Créée le',
            value: (row) => frenchDateOrder(row.createdAt),
            exportValue: (row) => row.createdAt,
            render: (row) => row.createdAt,
          },
          {
            key: 'status',
            label: 'Statut',
            filter: true,
            render: (row) => <StatusBadge status={row.status} />,
          },
        ]}
        actions={(alert) => [
          ...(alert.status === 'Nouvelle'
            ? [
                {
                  label: 'Acquitter',
                  onClick: () => setDialog({ alert, mode: 'acknowledge' }),
                },
              ]
            : []),
          ...(alert.status !== 'Résolue'
            ? [
                {
                  label: 'Résoudre',
                  onClick: () => setDialog({ alert, mode: 'resolve' }),
                },
              ]
            : []),
        ]}
      />
      {dialog && (
        <StockAlertConfirmDialog
          alert={dialog.alert}
          mode={dialog.mode}
          onCancel={() => setDialog(null)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  )
}
