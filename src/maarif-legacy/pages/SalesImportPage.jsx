import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CircleNotch,
  CloudArrowUp,
  FileText,
  FileCsv,
  Warning,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import { ArrowUpRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const SALES_IMPORT_STEPS = [
  'Téléverser',
  'Valider',
  'Aperçu',
  'Confirmer',
  'Résultats',
]
const SALES_CSV_COLUMNS = [
  ['order_reference', 'Référence unique de la commande'],
  ['order_date', 'Date et heure de la commande'],
  ['product_sku', 'SKU actif du catalogue'],
  ['quantity', 'Nombre entier strictement positif'],
  ['unit_price', 'Prix unitaire en MAD'],
  ['discount', 'Remise en MAD'],
  ['customer_city', 'Ville du client'],
  ['order_status', 'Statut de la commande'],
]
const IMPORT_STATUS_LABELS = {
  VALIDATING: 'Validation en cours',
  READY: 'Prêt',
  PROCESSING: 'En cours',
  COMPLETED: 'Terminé',
  FAILED: 'Échec',
  PARTIAL: 'À corriger',
  DUPLICATE: 'Doublon',
}
const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat('fr-MA', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Casablanca',
      }).format(new Date(value))
    : '—'
function SalesImportStepper({ step }) {
  return (
    <nav
      aria-label='Étapes de l’import des ventes'
      className='overflow-x-auto rounded-lg border bg-card p-4 text-card-foreground [&_li]:flex [&_li]:items-center [&_li]:gap-2 [&_li]:text-sm [&_ol]:flex [&_ol]:min-w-max [&_ol]:justify-between [&_ol]:gap-6 [&_strong]:font-medium'
    >
      <ol>
        {SALES_IMPORT_STEPS.map((label, index) => {
          const number = index + 1
          const completed = number < step
          return (
            <li
              aria-current={number === step ? 'step' : undefined}
              className={cn(
                number <= step ? 'text-foreground' : 'text-muted-foreground'
              )}
              key={label}
            >
              <Badge
                variant={number <= step ? 'default' : 'secondary'}
                className='flex size-7 items-center justify-center rounded-full p-0'
              >
                {completed ? (
                  <CheckCircle aria-hidden='true' weight='fill' />
                ) : (
                  number
                )}
              </Badge>
              <strong>{label}</strong>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function SalesImportPage({ onConfirm, onOpenHistory, onPreview }) {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [importError, setImportError] = useState('')

  const acceptFile = (nextFile) => {
    if (!nextFile) return
    if (!nextFile.name.toLowerCase().endsWith('.csv')) {
      setFile(null)
      setFileError('Sélectionnez un fichier CSV dont l’extension est .csv.')
      return
    }
    setFile(nextFile)
    setFileError('')
  }

  const validateFile = async () => {
    if (!file) {
      setFileError('Ajoutez un fichier CSV avant de lancer la validation.')
      return
    }
    setIsValidating(true)
    try {
      const result = await onPreview?.(file)
      if (!result) throw new Error('Aucune réponse de validation reçue.')
      setPreview(result ?? null)
      setIsValidating(false)
      setStep(2)
    } catch (error) {
      setIsValidating(false)
      setFileError(
        error instanceof Error ? error.message : 'Validation impossible.'
      )
    }
  }

  const startImport = async () => {
    setIsImporting(true)
    setImportError('')
    try {
      const confirmed = await onConfirm?.(preview)
      if (!confirmed) throw new Error('Aucune réponse de confirmation reçue.')
      setResult(confirmed)
      setStep(5)
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : 'Importation impossible.'
      )
    } finally {
      setIsImporting(false)
    }
  }

  const resetImport = () => {
    setStep(1)
    setFile(null)
    setFileError('')
    setIsImporting(false)
    setPreview(null)
    setResult(null)
    setImportError('')
  }

  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <header className='flex flex-wrap items-end justify-between gap-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_p]:text-sm [&_p]:text-muted-foreground [&_span]:text-sm [&_span]:text-muted-foreground'>
        <div>
          <p>Ventes · Fichier CSV</p>
          <h2>Importer les ventes</h2>
          <span>
            Ajoutez les ventes historiques en vérifiant les données avant leur
            enregistrement.
          </span>
        </div>
        <div className='flex flex-wrap items-center gap-4'>
          <Badge asChild>
            <a
              href='/imports/history'
              onClick={(event) => {
                event.preventDefault()
                onOpenHistory()
              }}
            >
              Historique <ArrowUpRightIcon data-icon='inline-end' />
            </a>
          </Badge>
        </div>
      </header>

      <SalesImportStepper step={step} />

      {step === 1 ? (
        <section
          aria-labelledby='upload-title'
          className='grid min-w-0 items-start gap-6 lg:grid-cols-2 [&_dd]:text-sm [&_dd]:text-muted-foreground [&_dl]:divide-y [&_dl>div]:grid [&_dl>div]:gap-1 [&_dl>div]:py-3 [&_dt]:font-mono [&_dt]:text-xs [&_dt]:font-medium [&_h3]:font-semibold [&_header]:p-0 [&_header_p]:text-sm [&_header_p]:text-muted-foreground [&_header_svg]:size-5 [&>div]:gap-4 [&>div]:p-6'
        >
          <Card className='min-w-0'>
            <CardHeader className='p-0 [&>svg]:size-5'>
              <CloudArrowUp aria-hidden='true' />
              <div>
                <CardTitle id='upload-title'>Téléverser le fichier</CardTitle>
                <CardDescription>
                  Un fichier CSV à la fois, 10 Mo maximum.
                </CardDescription>
              </div>
            </CardHeader>
            <label
              className={cn(
                'relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed bg-muted/30 p-8 text-center focus-within:ring-2 focus-within:ring-ring [&>span]:text-sm [&>span]:text-muted-foreground [&>svg]:size-10 [&>svg]:text-muted-foreground',
                isDragging ? 'border-primary bg-accent' : 'border-border',
                fileError && 'border-destructive'
              )}
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                acceptFile(event.dataTransfer.files[0])
              }}
            >
              <CloudArrowUp aria-hidden='true' weight='duotone' />
              <strong>Glissez-déposez votre fichier CSV ici</strong>
              <span>ou sélectionnez-le depuis votre ordinateur</span>
              <Button asChild variant='outline'>
                <span>Choisir un fichier</span>
              </Button>
              <Input
                className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                aria-label='Fichier CSV des ventes'
                accept='.csv,text/csv'
                aria-describedby={fileError ? 'sales-file-error' : undefined}
                aria-invalid={Boolean(fileError)}
                onChange={(event) => {
                  acceptFile(event.target.files[0])
                  event.target.value = ''
                }}
                type='file'
              />
            </label>
            {fileError ? (
              <Alert variant='destructive' id='sales-file-error'>
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            ) : null}
            {file ? (
              <div className='flex items-center gap-3 rounded-lg border p-3 [&_span]:text-xs [&_span]:text-muted-foreground [&_strong]:block [&_strong]:truncate [&_strong]:text-sm [&>div]:min-w-0 [&>div]:flex-1 [&>svg]:size-5 [&>svg]:shrink-0'>
                <FileCsv aria-hidden='true' weight='fill' />
                <div>
                  <strong>{file.name}</strong>
                  <span>
                    {(file.size / 1024).toLocaleString('fr', {
                      maximumFractionDigits: 1,
                    })}{' '}
                    Ko
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Retirer le fichier'
                  onClick={() => setFile(null)}
                  type='button'
                >
                  <X aria-hidden='true' />
                </Button>
              </div>
            ) : null}
            <CardFooter className='flex flex-wrap items-center justify-between gap-3 px-0'>
              <span>
                {file
                  ? 'Fichier prêt à être contrôlé.'
                  : 'Aucun fichier sélectionné.'}
              </span>
              <Button
                variant='default'
                disabled={isValidating}
                onClick={validateFile}
                type='button'
              >
                {isValidating ? (
                  <CircleNotch
                    aria-hidden='true'
                    className='size-4 animate-spin'
                  />
                ) : (
                  <ArrowRight aria-hidden='true' />
                )}
                {isValidating ? 'Validation…' : 'Valider le fichier'}
              </Button>
            </CardFooter>
          </Card>

          <Card className='min-w-0'>
            <CardHeader className='p-0 [&>svg]:size-5'>
              <FileText aria-hidden='true' />
              <div>
                <CardTitle>Colonnes attendues</CardTitle>
                <CardDescription>
                  La première ligne doit contenir exactement ces en-têtes.
                </CardDescription>
              </div>
            </CardHeader>
            <dl>
              {SALES_CSV_COLUMNS.map(([column, description]) => (
                <div key={column}>
                  <dt>{column}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
            <Alert>
              <WarningCircle aria-hidden='true' />
              <AlertDescription>
                Utilisez le point comme séparateur décimal et UTF-8 pour les
                titres ou villes en arabe.
              </AlertDescription>
            </Alert>
          </Card>
        </section>
      ) : null}

      {step === 2 ? (
        <Card
          aria-labelledby='validation-title'
          className='gap-6 p-6 [&_h3]:font-semibold [&_header_p]:text-sm [&>div[data-slot=card-header]]:p-0'
        >
          <CardHeader className='p-0 [&>svg]:size-5'>
            <CheckCircle aria-hidden='true' weight='fill' />
            <div>
              <CardTitle id='validation-title'>Validation terminée</CardTitle>
              <CardDescription>
                {preview?.fileName} · contrôlé le{' '}
                {formatDateTime(preview?.startedAt)}
              </CardDescription>
            </div>
          </CardHeader>
          <div
            className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&_small]:text-muted-foreground [&_span]:text-sm [&_span]:text-muted-foreground [&_strong]:block [&_strong]:text-2xl [&_strong]:font-bold [&>article]:rounded-lg [&>article]:border [&>article]:bg-card [&>article]:p-4'
            aria-label='Résumé de validation'
          >
            <Card className='gap-2 p-4'>
              <span>Lignes analysées</span>
              <strong>{preview?.totalRows}</strong>
              <small>hors en-tête</small>
            </Card>
            <Card className='gap-2 p-4'>
              <span>Lignes valides</span>
              <strong>{preview?.successfulRows}</strong>
              <small>acceptées par la validation</small>
            </Card>
            <Card className='gap-2 p-4'>
              <span>Erreurs</span>
              <strong>{preview?.failedRows}</strong>
              <small>à corriger avant import</small>
            </Card>
            <Card className='gap-2 p-4'>
              <span>Statut</span>
              <strong className='text-base'>
                {IMPORT_STATUS_LABELS[preview?.status] ?? '—'}
              </strong>
              <small>validation du serveur</small>
            </Card>
          </div>
          {preview?.failedRows > 0 ? (
            <Alert>
              <WarningCircle aria-hidden='true' />
              <AlertDescription>
                {preview.failedRows} lignes en erreur bloquent l’import.
                Corrigez le fichier, puis validez-le à nouveau.
              </AlertDescription>
            </Alert>
          ) : null}
          <CardFooter className='flex flex-wrap items-center justify-between gap-3 px-0'>
            <Button variant='outline' onClick={() => setStep(1)} type='button'>
              <ArrowLeft aria-hidden='true' />
              Remplacer le fichier
            </Button>
            <Button variant='default' onClick={() => setStep(3)} type='button'>
              Afficher l’aperçu
              <ArrowRight aria-hidden='true' />
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card
          aria-labelledby='preview-title'
          className='min-w-0 space-y-6 rounded-xl border bg-card p-6 text-card-foreground shadow-sm'
        >
          <header className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <CardTitle id='preview-title' className='font-semibold'>
                Résultat de la validation
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                Le serveur fournit les erreurs et les totaux, mais pas le détail
                des lignes valides.
              </p>
            </div>
            <Badge variant='outline'>
              {preview?.successfulRows} lignes valides
            </Badge>
          </header>
          {preview?.errors?.length ? (
            <div
              className='space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm [&_h4]:font-medium [&_li>span]:block [&_li>span]:text-muted-foreground [&_ol]:space-y-3 [&_p]:text-muted-foreground [&_svg]:size-5 [&_svg]:text-destructive [&>div]:flex [&>div]:items-start [&>div]:gap-3'
              aria-labelledby='row-errors-title'
            >
              <div>
                <WarningCircle aria-hidden='true' weight='fill' />
                <div>
                  <h4 id='row-errors-title'>
                    {preview.failedRows} lignes à corriger dans le fichier
                    source
                  </h4>
                  <p>Corrigez ces lignes avant de confirmer l’import.</p>
                </div>
              </div>
              <ol>
                {preview.errors.map((error, index) => (
                  <li key={`${error.rowNumber}-${error.field}-${index}`}>
                    <strong>
                      Ligne {error.rowNumber} · {error.field}
                    </strong>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          <CardFooter className='flex flex-wrap items-center justify-between gap-3 px-0'>
            <Button variant='outline' onClick={() => setStep(2)} type='button'>
              <ArrowLeft aria-hidden='true' />
              Retour à la validation
            </Button>
            <Button
              variant='default'
              disabled={preview?.status !== 'READY'}
              onClick={() => setStep(4)}
              type='button'
            >
              Continuer avec {preview?.successfulRows} lignes
              <ArrowRight aria-hidden='true' />
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {step === 4 && !isImporting ? (
        <Card
          aria-labelledby='confirm-title'
          className='gap-6 p-6 [&_h3]:font-semibold [&>div[data-slot=card-header]]:p-0'
        >
          <CardHeader className='p-0 [&>svg]:size-5'>
            <CheckCircle aria-hidden='true' />
            <div>
              <CardTitle id='confirm-title'>Confirmer l’import</CardTitle>
              <CardDescription>
                Vérifiez le périmètre final avant d’enregistrer les ventes.
              </CardDescription>
            </div>
          </CardHeader>
          <div className='grid gap-6 lg:grid-cols-2 [&_dd]:font-medium [&_dd]:break-words [&_dl]:grid [&_dl]:gap-4 [&_dt]:text-sm [&_dt]:text-muted-foreground [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5 [&>div]:space-y-2 [&>div]:rounded-lg [&>div]:border [&>div]:bg-muted/40 [&>div]:p-4'>
            <dl>
              <div>
                <dt>Fichier</dt>
                <dd>{preview?.fileName}</dd>
              </div>
              <div>
                <dt>Lignes qui seront importées</dt>
                <dd>{preview?.successfulRows}</dd>
              </div>
              <div>
                <dt>Lignes en erreur</dt>
                <dd>{preview?.failedRows}</dd>
              </div>
              <div>
                <dt>Effet métier</dt>
                <dd>Création des commandes et mouvements de stock</dd>
              </div>
            </dl>
            <div>
              <Warning aria-hidden='true' weight='fill' />
              <strong>Toutes les lignes doivent être valides</strong>
              <p>
                Le serveur n’autorise la confirmation que si la validation est
                sans erreur.
              </p>
            </div>
          </div>
          <div className='flex items-start gap-3 rounded-lg border p-4 text-sm text-muted-foreground [&_svg]:size-5 [&_svg]:shrink-0'>
            <WarningCircle aria-hidden='true' />
            <p>
              Après confirmation, {preview?.successfulRows} lignes valides
              seront enregistrées. Cette opération peut prendre quelques
              secondes.
            </p>
          </div>
          {importError ? (
            <Alert variant='destructive' role='alert'>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          ) : null}
          <CardFooter className='flex flex-wrap items-center justify-between gap-3 px-0'>
            <Button variant='outline' onClick={() => setStep(3)} type='button'>
              <ArrowLeft aria-hidden='true' />
              Retour à l’aperçu
            </Button>
            <Button variant='default' onClick={startImport} type='button'>
              <CheckCircle aria-hidden='true' />
              Confirmer l’import de {preview?.successfulRows} lignes
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {step === 4 && isImporting ? (
        <Card
          aria-labelledby='progress-title'
          className='items-center gap-4 p-6 text-center [&_h3]:font-semibold [&_small]:text-muted-foreground [&>span]:text-sm [&>span]:text-muted-foreground [&>svg]:size-8 [&>svg]:text-primary'
          aria-live='polite'
        >
          <CircleNotch aria-hidden='true' className='size-4 animate-spin' />
          <CardTitle id='progress-title'>
            Importation des ventes en cours…
          </CardTitle>
          <span>
            Création des commandes et enregistrement des mouvements de stock
            associés.
          </span>
          <small>Ne fermez pas cette page pendant l’import.</small>
        </Card>
      ) : null}

      {step === 5 ? (
        <Card
          aria-labelledby='results-title'
          className='gap-6 p-6 [&_h3]:font-semibold [&>div[data-slot=card-header]]:p-0'
        >
          <CardHeader className='p-0 [&>svg]:size-5'>
            <CheckCircle aria-hidden='true' weight='fill' />
            <div>
              <CardTitle id='results-title'>Import terminé</CardTitle>
              <CardDescription>
                {result?.fileName} · terminé le{' '}
                {formatDateTime(result?.completedAt)}
              </CardDescription>
            </div>
          </CardHeader>
          <div
            className='flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300 [&_p]:text-sm [&>svg]:size-5 [&>svg]:shrink-0'
            role='status'
          >
            <CheckCircle aria-hidden='true' weight='fill' />
            <div>
              <strong>
                {result?.successfulRows} lignes ont été importées avec succès.
              </strong>
              <p>
                Les commandes et mouvements de stock sont maintenant disponibles
                dans Maarif Analytics.
              </p>
            </div>
          </div>
          <div
            className='grid gap-4 sm:grid-cols-2 [&_span]:text-sm [&_span]:text-muted-foreground [&_strong]:block [&_strong]:text-2xl [&_strong]:font-bold [&>article]:rounded-lg [&>article]:border [&>article]:p-4'
            aria-label='Statistiques finales de l’import'
          >
            <Card className='gap-2 p-4'>
              <span>Lignes importées</span>
              <strong>{result?.successfulRows}</strong>
            </Card>
            <Card className='gap-2 p-4'>
              <span>Lignes rejetées</span>
              <strong>{result?.failedRows}</strong>
            </Card>
          </div>
          {result?.failedRows > 0 ? (
            <div className='flex flex-wrap items-start gap-3 rounded-lg border p-4 [&_p]:text-sm [&_p]:text-muted-foreground [&>div]:min-w-48 [&>div]:flex-1 [&>svg]:size-5'>
              <WarningCircle aria-hidden='true' />
              <div>
                <strong>
                  {result.failedRows} lignes nécessitent une correction
                </strong>
                <p>Corrigez le fichier source, puis lancez un nouvel import.</p>
              </div>
            </div>
          ) : null}
          <CardFooter className='flex flex-wrap items-center justify-between gap-3 px-0'>
            <span>Import IMP-{result?.id}</span>
            <Button variant='default' onClick={resetImport} type='button'>
              <CloudArrowUp aria-hidden='true' />
              Importer un autre fichier
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  )
}
