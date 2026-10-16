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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ProductImage } from '@/features/maarif/product-image'
import { RecordsTable } from '@/features/maarif/records-table'
import { StatusBadge } from '@/features/maarif/status-badge'
import { frenchDateOrder } from '@/features/maarif/table-format'
import { TablePageHeading, TableFeedback } from '@/features/maarif/table-page'
import { ErrorMessage } from '../shared/ErrorMessage.jsx'
import { formatMad } from '../shared/catalogData.js'

function InventoryStatus({ stock, threshold }) {
  if (stock === 0)
    return <span className='catalog-status catalog-status--out'>Rupture</span>
  if (stock <= threshold)
    return (
      <span className='catalog-status catalog-status--low'>Stock faible</span>
    )
  return (
    <span className='catalog-status catalog-status--active'>Stock normal</span>
  )
}

function StockMovementDialog({ inventory, onClose, onRecord }) {
  const [sku, setSku] = useState(inventory[0]?.sku ?? '')
  const [movementType, setMovementType] = useState('Achat')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState('form')
  const [isSaving, setIsSaving] = useState(false)
  const selectedProduct =
    inventory.find((product) => product.sku === sku) ?? inventory[0]
  const parsedQuantity = Number(quantity)
  const setsStockLevel =
    movementType === 'Stock initial' || movementType === 'Correction'
  const removesStock =
    movementType === 'Retour fournisseur' || movementType === 'Dommage'
  const quantityIsValid =
    quantity !== '' &&
    Number.isSafeInteger(parsedQuantity) &&
    (setsStockLevel ? parsedQuantity >= 0 : parsedQuantity > 0)
  const stockChange = !quantityIsValid
    ? 0
    : setsStockLevel
      ? parsedQuantity - selectedProduct.stock
      : removesStock
        ? -parsedQuantity
        : parsedQuantity
  const stockAfter = selectedProduct.stock + stockChange
  const createsNegativeStock = quantityIsValid && stockAfter < 0
  const changeLabel = `${stockChange > 0 ? '+' : ''}${stockChange}`

  const resetForEditing = () => {
    setStep('form')
    setIsSaving(false)
  }

  const validate = () => {
    const nextErrors = {}
    if (!quantityIsValid)
      nextErrors.quantity = setsStockLevel
        ? 'Saisissez un stock compté entier supérieur ou égal à zéro.'
        : 'Saisissez une quantité entière supérieure à zéro.'
    if (!reason.trim())
      nextErrors.reason = 'Précisez la raison de ce mouvement.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0 && !createsNegativeStock
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validate()) return
    setStep('confirm')
  }

  const confirm = async () => {
    setIsSaving(true)
    try {
      await onRecord({
        movementType,
        nextStock: stockAfter,
        quantity: stockChange,
        reason: reason.trim(),
        sku,
      })
    } catch (error) {
      setErrors({
        submission:
          error instanceof Error
            ? error.message
            : 'Impossible d’enregistrer le mouvement.',
      })
      setIsSaving(false)
    }
  }

  const explanation = !quantityIsValid
    ? 'Saisissez une quantité pour prévisualiser l’effet sur le stock.'
    : setsStockLevel
      ? `${movementType} : le stock compté remplacera le niveau actuel (${changeLabel} exemplaires).`
      : removesStock
        ? `${movementType} : ${parsedQuantity} exemplaire${parsedQuantity > 1 ? 's' : ''} ${parsedQuantity > 1 ? 'seront retirés' : 'sera retiré'} du stock.`
        : `${movementType} : ${parsedQuantity} exemplaire${parsedQuantity > 1 ? 's' : ''} ${parsedQuantity > 1 ? 'seront ajoutés' : 'sera ajouté'} au stock.`

  const impact = (
    <Card className='gap-0 bg-muted/30 py-4'>
      <CardContent className='space-y-3 px-4'>
        <dl className='grid grid-cols-3 gap-3 text-center'>
          {[
            ['Stock actuel', selectedProduct.stock],
            ['Variation', quantityIsValid ? changeLabel : '—'],
            ['Stock résultant', quantityIsValid ? stockAfter : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className='text-xs text-muted-foreground'>{label}</dt>
              <dd className='mt-1 text-xl font-semibold tabular-nums'>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <p className='text-sm text-muted-foreground'>{explanation}</p>
      </CardContent>
    </Card>
  )
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose()
      }}
    >
      <DialogContent
        className='max-h-[90svh] overflow-y-auto sm:max-w-2xl'
        showCloseButton={!isSaving}
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (isSaving) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {step === 'form'
              ? 'Enregistrer un mouvement de stock'
              : 'Confirmer le mouvement'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form'
              ? 'Renseignez le mouvement et vérifiez son effet sur le stock.'
              : 'Vérifiez les informations avant de modifier le stock.'}
          </DialogDescription>
        </DialogHeader>
        {step === 'form' ? (
          <form noValidate onSubmit={submit} className='grid gap-5!'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor='movement-product'>Produit</Label>
                <Select
                  value={sku}
                  onValueChange={(value) => {
                    setSku(value)
                    setErrors({})
                  }}
                >
                  <SelectTrigger
                    id='movement-product'
                    className='w-full min-w-0 [&>span]:truncate'
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map((product) => (
                      <SelectItem key={product.sku} value={product.sku}>
                        {product.title} — {product.sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='movement-type'>Type de mouvement</Label>
                <Select
                  value={movementType}
                  onValueChange={(value) => {
                    setMovementType(value)
                    setQuantity('')
                    setErrors({})
                  }}
                >
                  <SelectTrigger id='movement-type' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Stock initial',
                      'Achat',
                      'Retour client',
                      'Retour fournisseur',
                      'Dommage',
                      'Correction',
                    ].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='movement-quantity'>
                  {setsStockLevel ? 'Stock compté' : 'Quantité'}
                </Label>
                <Input
                  id='movement-quantity'
                  type='number'
                  step='1'
                  min={setsStockLevel ? 0 : 1}
                  inputMode='numeric'
                  value={quantity}
                  placeholder='0'
                  aria-invalid={
                    Boolean(errors.quantity) || createsNegativeStock
                  }
                  aria-describedby={
                    errors.quantity
                      ? 'movement-quantity-error'
                      : createsNegativeStock
                        ? 'movement-negative-error'
                        : undefined
                  }
                  onChange={(event) => {
                    setQuantity(event.target.value)
                    setErrors((current) => ({ ...current, quantity: '' }))
                  }}
                />
                {errors.quantity && (
                  <p
                    id='movement-quantity-error'
                    role='alert'
                    className='text-sm text-destructive'
                  >
                    {errors.quantity}
                  </p>
                )}
              </div>
              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor='movement-reason'>Raison</Label>
                <Textarea
                  id='movement-reason'
                  rows={3}
                  value={reason}
                  placeholder='Ex. Réception de la commande fournisseur REC-2026-0324'
                  aria-invalid={Boolean(errors.reason)}
                  aria-describedby={
                    errors.reason ? 'movement-reason-error' : undefined
                  }
                  onChange={(event) => {
                    setReason(event.target.value)
                    setErrors((current) => ({ ...current, reason: '' }))
                  }}
                />
                {errors.reason && (
                  <p
                    id='movement-reason-error'
                    role='alert'
                    className='text-sm text-destructive'
                  >
                    {errors.reason}
                  </p>
                )}
              </div>
            </div>
            <div aria-live='polite'>{impact}</div>
            {createsNegativeStock && (
              <Alert variant='destructive' id='movement-negative-error'>
                <WarningCircle />
                <AlertTitle>Stock négatif impossible</AlertTitle>
                <AlertDescription>
                  Ce mouvement ferait passer le stock de {selectedProduct.stock}{' '}
                  à {stockAfter}. Réduisez la quantité avant de continuer.
                </AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button variant='outline' type='button' onClick={onClose}>
                Annuler
              </Button>
              <Button disabled={createsNegativeStock} type='submit'>
                Vérifier le mouvement
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className='space-y-5'>
            <dl className='grid gap-4 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-muted-foreground'>Produit</dt>
                <dd className='font-medium'>{selectedProduct.title}</dd>
                <dd className='text-xs text-muted-foreground'>
                  {selectedProduct.sku}
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>Type</dt>
                <dd className='font-medium'>{movementType}</dd>
              </div>
              <div className='sm:col-span-2'>
                <dt className='text-muted-foreground'>Raison</dt>
                <dd className='font-medium break-words'>{reason}</dd>
              </div>
            </dl>
            {impact}
            {errors.submission && (
              <Alert variant='destructive' role='alert'>
                <AlertDescription>{errors.submission}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button
                variant='outline'
                disabled={isSaving}
                onClick={resetForEditing}
              >
                Modifier
              </Button>
              <Button disabled={isSaving} onClick={confirm}>
                {isSaving ? (
                  <CircleNotch className='animate-spin' />
                ) : (
                  <CheckCircle />
                )}
                {isSaving ? 'Enregistrement…' : 'Confirmer et enregistrer'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function InventoryManagement({
  inventoryData,
  historyData,
  onRecordMovement,
}) {
  const [inventory, setInventory] = useState(inventoryData ?? [])
  const [history, setHistory] = useState(historyData ?? [])
  const [showMovementDialog, setShowMovementDialog] = useState(false)
  const [feedback, setFeedback] = useState('')
  const stockState = (product) =>
    product.stock === 0
      ? 'Rupture de stock'
      : product.stock <= product.threshold
        ? 'Stock faible'
        : 'Disponible'
  useEffect(() => {
    if (inventoryData) setInventory(inventoryData)
  }, [inventoryData])
  useEffect(() => {
    if (historyData) setHistory(historyData)
  }, [historyData])
  const recordMovement = async ({
    movementType,
    nextStock,
    quantity,
    reason,
    sku,
  }) => {
    const product = inventory.find((item) => item.sku === sku)
    const created = await onRecordMovement({
      movementType,
      nextStock,
      quantity,
      reason,
      sku,
      product,
    })
    setInventory((current) =>
      current.map((item) =>
        item.sku === sku ? { ...item, stock: created.balance } : item
      )
    )
    setHistory((current) => [created, ...current])
    setShowMovementDialog(false)
    setFeedback('Mouvement enregistré pour ' + product.title + '.')
  }
  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <TablePageHeading
        title='Inventaire'
        description='Consultez les stocks et enregistrez chaque mouvement.'
      >
        <Button
          disabled={inventory.length === 0}
          onClick={() => setShowMovementDialog(true)}
        >
          <Plus />
          Enregistrer un mouvement
        </Button>
      </TablePageHeading>
      <TableFeedback message={feedback} onDismiss={() => setFeedback('')} />
      <RecordsTable
        label='État de l’inventaire'
        bulkSelection={{
          entityName: 'produit',
          exportFileName: 'inventaire-selection.csv',
        }}
        data={inventory}
        rowId={(row) => row.sku}
        rowLabel={(row) => row.title}
        searchPlaceholder='Rechercher un produit ou SKU…'
        fields={[
          { key: 'sku', label: 'SKU' },
          {
            key: 'title',
            label: 'Produit',
            render: (row) => (
              <div className='flex items-center gap-2'>
                <ProductImage title={row.title} imageUrl={row.imageUrl} />
                <span
                  className='font-medium'
                  dir={row.language === 'Arabe' ? 'rtl' : undefined}
                >
                  {row.title}
                </span>
              </div>
            ),
          },
          { key: 'category', label: 'Catégorie', filter: true, hidden: true },
          { key: 'language', label: 'Langue', filter: true, hidden: true },
          {
            key: 'stock',
            label: 'Stock actuel',
            render: (row) => (
              <span
                className={
                  row.stock <= row.threshold
                    ? 'font-medium text-destructive'
                    : 'tabular-nums'
                }
              >
                {row.stock} ex.
              </span>
            ),
          },
          { key: 'threshold', label: 'Seuil minimum' },
          {
            key: 'value',
            label: 'Valeur du stock',
            value: (row) => row.stock * row.purchaseCost,
            render: (row) => formatMad(row.stock * row.purchaseCost),
          },
          {
            key: 'state',
            label: 'État du stock',
            value: stockState,
            filter: true,
            render: (row) => <StatusBadge status={stockState(row)} />,
          },
        ]}
      />
      <h3 className='text-lg font-semibold'>Mouvements récents</h3>
      <RecordsTable
        label='Mouvements récents'
        data={history}
        rowId={(row) => row.id}
        selectable={false}
        searchPlaceholder='Rechercher un mouvement…'
        fields={[
          {
            key: 'date',
            label: 'Date',
            value: (row) => frenchDateOrder(row.date),
            render: (row) => row.date,
          },
          {
            key: 'product',
            label: 'Produit',
            render: (row) => (
              <div className='flex items-center gap-2'>
                <ProductImage title={row.product} imageUrl={row.imageUrl} />
                {row.product}
              </div>
            ),
          },
          { key: 'sku', label: 'SKU', hidden: true },
          {
            key: 'type',
            label: 'Type',
            filter: true,
            render: (row) => <Badge variant='outline'>{row.type}</Badge>,
          },
          {
            key: 'quantity',
            label: 'Quantité',
            render: (row) => (row.quantity > 0 ? '+' : '') + row.quantity,
          },
          { key: 'balance', label: 'Stock après' },
          { key: 'reference', label: 'Référence' },
        ]}
      />
      {showMovementDialog && (
        <StockMovementDialog
          inventory={inventory}
          onClose={() => setShowMovementDialog(false)}
          onRecord={recordMovement}
        />
      )}
    </div>
  )
}
