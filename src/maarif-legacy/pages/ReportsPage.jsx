import { useState } from 'react'
import {
  Archive,
  ChartLineUp,
  CheckCircle,
  CircleNotch,
  FileText,
  FileCsv,
  Truck,
  WarningCircle,
  ArrowClockwise,
  DownloadSimple,
  X,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DateRangePicker as ReportPeriodPicker } from '@/components/date-range-picker'
import { ReportFilter } from '@/features/maarif/report-filter'
import { DateRangePicker as ReportDateRangePicker } from '../shared/DateRangePicker.jsx'
import {
  DEFAULT_FILTERS,
  FILTER_DEFINITIONS,
} from '../shared/dashboardFilters.jsx'

const REPORT_OPTIONS = [
  {
    id: 'sales',
    title: 'Rapport des ventes',
    description: 'Commandes, quantités, remises et chiffre d’affaires.',
    detail: '1 248 commandes · 2 914 exemplaires',
    icon: ChartLineUp,
  },
  {
    id: 'inventory',
    title: 'État de l’inventaire',
    description: 'Stock actuel, valorisation et couverture par produit.',
    detail: '1 486 produits actifs',
    icon: Archive,
  },
  {
    id: 'low-stock',
    title: 'Produits en stock faible',
    description: 'Produits sous leur seuil minimum ou en rupture.',
    detail: '33 produits concernés',
    icon: WarningCircle,
  },
  {
    id: 'reorder',
    title: 'Réapprovisionnements',
    description: 'Quantités recommandées selon stock et prévisions.',
    detail: '27 recommandations actives',
    icon: Truck,
  },
  {
    id: 'management',
    title: 'Rapport mensuel de gestion',
    description: 'Synthèse des ventes, marges, stocks et alertes du mois.',
    detail: 'Août 2026 · Synthèse direction',
    icon: FileText,
  },
]

export function ReportsPage({ onExport }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selectedReportId, setSelectedReportId] = useState('sales')
  const [exportState, setExportState] = useState(null)
  const selectedReport =
    REPORT_OPTIONS.find((option) => option.id === selectedReportId) ??
    REPORT_OPTIONS[0]
  const SelectedReportIcon = selectedReport.icon
  const isGenerating = exportState?.status === 'progress'

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setExportState(null)
  }

  const selectReport = (id) => {
    setSelectedReportId(id)
    setExportState(null)
  }

  const updatePeriod = (range) => {
    if (!range.from || !range.to) return
    const formatDate = (date) =>
      date.toLocaleDateString('fr-MA', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    updateFilter(
      'period',
      `${formatDate(range.from)} – ${formatDate(range.to)}`
    )
  }

  const handleExport = async (format) => {
    setExportState({ status: 'progress', format, progress: 18 })
    window.setTimeout(
      () =>
        setExportState((current) =>
          current?.status === 'progress'
            ? { ...current, progress: 54 }
            : current
        ),
      260
    )
    window.setTimeout(
      () =>
        setExportState((current) =>
          current?.status === 'progress'
            ? { ...current, progress: 82 }
            : current
        ),
      560
    )
    window.setTimeout(async () => {
      try {
        await onExport?.({ filters, format, reportId: selectedReportId })
      } catch {
        setExportState({
          status: 'error',
          format,
          message: 'Le rapport n’a pas pu être généré. Réessayez.',
        })
        return
      }
      const timestamp = new Date()
        .toISOString()
        .slice(0, 16)
        .replace(/[:T]/g, '-')
      const extension = format.toLowerCase()
      setExportState({
        status: 'success',
        format,
        fileName: `maarif_${selectedReportId}_${timestamp}.${extension}`,
      })
    }, 980)
  }

  const reportContents =
    selectedReportId === 'sales'
      ? [
          'Référence et date de commande',
          'Produit, quantité et remise',
          'Source, ville et total en MAD',
        ]
      : selectedReportId === 'inventory'
        ? [
            'SKU et informations produit',
            'Stock actuel et valeur d’inventaire',
            'Seuil minimum et statut de stock',
          ]
        : selectedReportId === 'low-stock'
          ? [
              'Produit et niveau de stock',
              'Seuil minimum et écart',
              'Sévérité et date de l’alerte',
            ]
          : selectedReportId === 'reorder'
            ? [
                'Stock, délai et stock de sécurité',
                'Point de commande',
                'Quantité recommandée',
              ]
            : [
                'Synthèse des ventes et marges',
                'Situation des stocks et alertes',
                'Recommandations de gestion',
              ]

  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <Card>
        <CardHeader>
          <CardTitle id='report-options-title'>Choisir un rapport</CardTitle>
          <CardDescription>
            Un seul rapport peut être exporté à la fois.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          <fieldset
            aria-label='Filtres du rapport'
            disabled={isGenerating}
            className='flex flex-wrap items-center gap-2 border-b pb-5'
          >
            <div className='w-full sm:w-56 [&_button]:h-8'>
              <ReportPeriodPicker
                key={filters.period}
                align='start'
                initialDateFrom={new Date(2026, 7, 1)}
                initialDateTo={new Date(2026, 7, 27)}
                locale='fr-MA'
                onUpdate={updatePeriod}
              />
            </div>
            {FILTER_DEFINITIONS.filter(
              (definition) => definition.key !== 'period'
            ).map((definition) => (
              <ReportFilter
                key={definition.key}
                title={definition.label}
                value={filters[definition.key]}
                options={definition.options}
                disabled={isGenerating}
                onChange={(value) => updateFilter(definition.key, value)}
              />
            ))}
            {FILTER_DEFINITIONS.some(
              (definition) =>
                filters[definition.key] !== DEFAULT_FILTERS[definition.key]
            ) && (
              <Button
                variant='ghost'
                className='h-8 px-2 lg:px-3'
                disabled={isGenerating}
                onClick={() => {
                  setFilters(DEFAULT_FILTERS)
                  setExportState(null)
                }}
              >
                Réinitialiser
                <X />
              </Button>
            )}
          </fieldset>
          <RadioGroup
            value={selectedReportId}
            disabled={isGenerating}
            onValueChange={selectReport}
            aria-labelledby='report-options-title'
            className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'
          >
            {REPORT_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <Label
                  key={option.id}
                  htmlFor={`report-type-${option.id}`}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent',
                    selectedReportId === option.id &&
                      'border-primary bg-primary/5',
                    isGenerating && 'cursor-wait opacity-60'
                  )}
                >
                  <RadioGroupItem
                    id={`report-type-${option.id}`}
                    value={option.id}
                    className='mt-1 shrink-0'
                  />
                  <div className='min-w-0 space-y-2'>
                    <Icon className='size-5 text-muted-foreground' />
                    <p className='font-medium'>{option.title}</p>
                    <p className='text-sm font-normal text-muted-foreground'>
                      {option.description}
                    </p>
                    <p className='text-xs font-normal text-muted-foreground'>
                      {option.detail}
                    </p>
                  </div>
                </Label>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>
      <div className='grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
        <Card className='min-w-0'>
          <CardHeader>
            <CardTitle>Préparer l’export</CardTitle>
            <CardDescription>{selectedReport.title}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {exportState?.status === 'progress' && (
              <Alert aria-busy='true' role='status'>
                <CircleNotch className='animate-spin' />
                <AlertTitle>
                  Génération du rapport {exportState.format}…
                </AlertTitle>
                <AlertDescription>
                  <p>Préparation et mise en forme des données.</p>
                  <div
                    role='progressbar'
                    aria-label='Progression de l’export'
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={exportState.progress}
                    className='my-2 h-2 w-full overflow-hidden rounded-full bg-primary/20'
                  >
                    <div
                      className='h-full bg-primary transition-all'
                      style={{ width: `${exportState.progress}%` }}
                    />
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {exportState?.status === 'success' && (
              <Alert
                role='status'
                className='border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300'
              >
                <CheckCircle />
                <AlertTitle>Rapport généré avec succès.</AlertTitle>
                <AlertDescription className='w-full text-inherit'>
                  <p className='break-all'>{exportState.fileName}</p>
                  <Button
                    variant='ghost'
                    size='sm'
                    aria-label='Fermer le message de réussite'
                    onClick={() => setExportState(null)}
                  >
                    <X />
                    Fermer
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {exportState?.status === 'error' && (
              <Alert variant='destructive'>
                <WarningCircle />
                <AlertTitle>Échec de l’export {exportState.format}</AlertTitle>
                <AlertDescription>
                  <p>{exportState.message}</p>
                  <Button
                    variant='outline'
                    className='mt-2'
                    onClick={() => handleExport(exportState.format)}
                  >
                    <ArrowClockwise />
                    Réessayer
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <div className='flex items-start gap-3'>
              <SelectedReportIcon className='size-6 shrink-0 text-muted-foreground' />
              <div>
                <h3 className='font-semibold'>{selectedReport.title}</h3>
                <p className='text-sm text-muted-foreground'>
                  {selectedReport.description}
                </p>
              </div>
            </div>
            <dl className='grid gap-4 sm:grid-cols-2'>
              {FILTER_DEFINITIONS.map((definition) => (
                <div key={definition.key}>
                  <dt className='text-sm text-muted-foreground'>
                    {definition.label}
                  </dt>
                  <dd className='text-sm font-medium'>
                    {filters[definition.key]}
                  </dd>
                </div>
              ))}
            </dl>
            <div className='space-y-3'>
              <h3 className='font-medium'>Contenu inclus</h3>
              <ul className='space-y-2'>
                {reportContents.map((item) => (
                  <li
                    key={item}
                    className='flex items-center gap-2 text-sm text-muted-foreground'
                  >
                    <CheckCircle className='size-4 shrink-0' />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Format d’export</CardTitle>
            <CardDescription>
              Le fichier respecte les filtres appliqués.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Button
              className='h-auto w-full justify-start gap-3 py-4 text-left whitespace-normal'
              disabled={isGenerating}
              onClick={() => handleExport('CSV')}
            >
              <FileCsv />
              <span>
                <span className='block font-medium'>Exporter en CSV</span>
                <span className='text-xs opacity-80'>
                  Données structurées · UTF-8
                </span>
              </span>
              <DownloadSimple className='ml-auto shrink-0' />
            </Button>
            <Button
              variant='outline'
              className='h-auto w-full justify-start gap-3 py-4 text-left whitespace-normal'
              disabled={isGenerating}
              onClick={() => handleExport('PDF')}
            >
              <FileText />
              <span>
                <span className='block font-medium'>Exporter en PDF</span>
                <span className='text-xs text-muted-foreground'>
                  Document prêt à partager
                </span>
              </span>
              <DownloadSimple className='ml-auto shrink-0' />
            </Button>
            <p className='text-xs text-muted-foreground'>
              Les exports utilisent uniquement des données synthétiques dans ce
              prototype.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
