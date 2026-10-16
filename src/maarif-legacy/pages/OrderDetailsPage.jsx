import { useState } from 'react'
import {
  ArrowLeft,
  CalendarBlank,
  CheckCircle,
  CircleNotch,
  CurrencyDollar,
  MapPin,
  Prohibit,
  ShoppingCart,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { ProductImage } from '@/features/maarif/product-image'
import { RecordsTable } from '@/features/maarif/records-table'
import { formatMad } from '../shared/catalogData.js'

export function OrderDetailsPage({
  onBack,
  onCancelOrder,
  order,
  role = 'Gestionnaire',
}) {
  const details = order.details ?? { lines: [], movements: [] }
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [dateLabel, timeLabel] = order.date.split(' à ')
  const canCancel =
    ['Administrateur', 'Gestionnaire'].includes(role) &&
    ['Brouillon', 'En préparation'].includes(order.status)
  const statusTone = {
    Livrée: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    Expédiée: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    'En préparation':
      'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    Annulée: 'bg-destructive/10 text-destructive',
    Brouillon:
      'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  }[order.status]

  const cancelOrder = async () => {
    setIsCancelling(true)
    setError('')
    try {
      await onCancelOrder(order)
      setShowCancelDialog(false)
      setFeedback(`Commande ${order.reference} annulée.`)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Impossible d’annuler la commande. Veuillez réessayer.'
      )
    } finally {
      setIsCancelling(false)
    }
  }

  const metrics = [
    {
      label: 'Date',
      value: dateLabel,
      detail: timeLabel ? `à ${timeLabel}` : 'Date de création',
      icon: CalendarBlank,
    },
    {
      label: 'Source',
      value: order.source,
      detail: 'Canal de création',
      icon: ShoppingCart,
    },
    {
      label: 'Ville du client',
      value: order.city || '—',
      detail: 'Maroc',
      icon: MapPin,
    },
    {
      label: 'Montant total',
      value: formatMad(order.total),
      detail: 'Remises incluses',
      icon: CurrencyDollar,
    },
  ]

  return (
    <div className='flex min-w-0 flex-col gap-6'>
      {feedback ? (
        <Alert
          role='status'
          className='border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300'
        >
          <CheckCircle aria-hidden='true' />
          <AlertTitle>Commande annulée</AlertTitle>
          <AlertDescription className='flex w-full flex-row items-center justify-between gap-3 text-inherit'>
            {feedback}
            <Button
              variant='ghost'
              size='icon'
              aria-label='Fermer le message'
              onClick={() => setFeedback('')}
            >
              <X aria-hidden='true' />
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <header className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end'>
        <div className='min-w-0 space-y-3'>
          <Button
            variant='ghost'
            size='sm'
            className='-ms-3 text-muted-foreground'
            onClick={onBack}
          >
            <ArrowLeft aria-hidden='true' />
            Retour aux commandes
          </Button>
          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>Commande client</p>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='text-2xl font-bold tracking-tight break-all'>
                {order.reference}
              </h2>
              <Badge variant='secondary' className={statusTone}>
                {order.status}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>
              {order.itemCount} exemplaire{order.itemCount > 1 ? 's' : ''} ·{' '}
              {order.source}
            </p>
          </div>
        </div>
        <AlertDialog
          open={showCancelDialog}
          onOpenChange={(open) => {
            if (!isCancelling) {
              setShowCancelDialog(open)
              setError('')
            }
          }}
        >
          {canCancel ? (
            <AlertDialogTrigger asChild>
              <Button
                variant='outline'
                className='w-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto'
              >
                <Prohibit aria-hidden='true' />
                Annuler la commande
              </Button>
            </AlertDialogTrigger>
          ) : null}
          <AlertDialogContent
            onEscapeKeyDown={(event) => {
              if (isCancelling) event.preventDefault()
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Annuler {order.reference} ?</AlertDialogTitle>
              <AlertDialogDescription>
                La commande passera au statut Annulée. Les éventuels retours en
                stock seront enregistrés par le service de commandes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error ? (
              <Alert variant='destructive'>
                <WarningCircle aria-hidden='true' />
                <AlertTitle>Annulation impossible</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>
                Retour
              </AlertDialogCancel>
              <Button
                variant='destructive'
                disabled={isCancelling}
                onClick={cancelOrder}
              >
                {isCancelling ? (
                  <>
                    <CircleNotch aria-hidden='true' className='animate-spin' />
                    Annulation…
                  </>
                ) : (
                  'Confirmer l’annulation'
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
      <section
        aria-label='Résumé de la commande'
        className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
      >
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className='min-w-0 gap-2 py-5'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 px-5'>
              <CardDescription>{label}</CardDescription>
              <Icon
                aria-hidden='true'
                className='size-4 shrink-0 text-muted-foreground'
              />
            </CardHeader>
            <CardContent className='space-y-1 px-5'>
              <p className='text-xl font-bold tracking-tight break-words tabular-nums'>
                {value}
              </p>
              <p className='text-xs text-muted-foreground'>{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <Card className='min-w-0'>
        <CardHeader>
          <CardTitle>Articles de la commande</CardTitle>
          <CardDescription>
            {details.lines.length} lignes · {order.itemCount} exemplaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecordsTable
            label='Articles de la commande'
            data={details.lines}
            fields={[
              {
                key: 'product',
                label: 'Produit',
                render: (line) => (
                  <div className='flex items-center gap-2'>
                    <ProductImage
                      title={line.product}
                      imageUrl={line.imageUrl}
                    />
                    <div>
                      <span className='font-medium'>{line.product}</span>
                      <div className='text-xs text-muted-foreground'>
                        {line.sku}
                      </div>
                    </div>
                  </div>
                ),
              },
              { key: 'sku', label: 'SKU', hidden: true },
              { key: 'quantity', label: 'Quantité' },
              {
                key: 'unitPrice',
                label: 'Prix unitaire',
                render: (line) => formatMad(line.unitPrice),
              },
              {
                key: 'discount',
                label: 'Remise',
                render: (line) => (line.discount ? `${line.discount} %` : '—'),
              },
              {
                key: 'lineTotal',
                label: 'Total ligne',
                render: (line) => formatMad(line.lineTotal),
              },
            ]}
            rowId={(line) => line.sku}
            selectable={false}
            summary={{
              label: 'Total de la commande',
              value: formatMad(order.total),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
