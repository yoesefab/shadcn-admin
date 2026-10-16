import { useState } from 'react'
import { CATALOG_PERMISSIONS } from '@/maarif-legacy/shared/catalogData.js'
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  PackageCheck,
  Pencil,
  ShoppingCart,
  TrendingUp,
  Truck,
  Undo2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductImage } from './product-image'

const RECENT_SALES = [
  ['25–27 août 2026', '38', '2 964,00 MAD'],
  ['18–24 août 2026', '74', '5 772,00 MAD'],
  ['11–17 août 2026', '81', '6 318,00 MAD'],
  ['04–10 août 2026', '69', '5 382,00 MAD'],
  ['01–03 août 2026', '50', '3 900,00 MAD'],
]

const INVENTORY_MOVEMENTS = [
  ['27 août 2026 à 16:42', 'Vente — CMD-2026-1842', '−2', '42', 'out'],
  ['27 août 2026 à 11:08', 'Vente — CMD-2026-1834', '−1', '44', 'out'],
  ['26 août 2026 à 15:20', 'Réception fournisseur', '+24', '45', 'in'],
  ['26 août 2026 à 09:14', 'Vente — CMD-2026-1807', '−3', '21', 'out'],
  ['25 août 2026 à 18:06', 'Ajustement après inventaire', '+1', '24', 'in'],
] as const

type Product = {
  imageUrl?: string | null
  active: boolean
  author: string
  category: string
  description?: string | null
  isbn?: string | null
  language: string
  price: number
  publisher?: string | null
  purchaseCost?: number | null
  sku: string
  stock: number
  supplier?: string | null
  supplierLeadTime?: number | null
  threshold: number
  title: string
  updatedAtLabel?: string
}

type ProductDetailsProps = {
  onBack: () => void
  onDisable?: (sku: string) => Promise<void>
  onEdit: (product: Product) => void
  product: Product
  role?: keyof typeof CATALOG_PERMISSIONS
}

const money = (value: number) =>
  `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`

function ProductStatus({
  active,
  stock,
  threshold,
}: Pick<Product, 'active' | 'stock' | 'threshold'>) {
  if (!active) return <Badge variant='secondary'>Désactivé</Badge>
  if (stock === 0) return <Badge variant='destructive'>Rupture</Badge>
  if (stock <= threshold)
    return (
      <Badge className='border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'>
        Stock faible
      </Badge>
    )
  return <Badge className='bg-emerald-600'>Actif</Badge>
}

function DetailCard({
  description,
  icon: Icon,
  title,
  children,
}: {
  description: string
  icon: typeof BookOpen
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className='min-w-0'>
      <CardHeader className='flex-row items-start gap-3'>
        <span className='rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'>
          <Icon className='size-5' />
        </span>
        <div className='space-y-1'>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function DefinitionList({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className='grid gap-4 sm:grid-cols-2'>
      {items.map(([label, value]) => (
        <div className='space-y-1' key={label}>
          <dt className='text-xs font-medium text-muted-foreground'>{label}</dt>
          <dd className='text-sm font-medium'>{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export function ProductDetails({
  onBack,
  onDisable,
  onEdit,
  product,
  role = 'Gestionnaire',
}: ProductDetailsProps) {
  const permissions = CATALOG_PERMISSIONS[role]
  const [active, setActive] = useState(product.active)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState(false)
  const margin = product.price - (product.purchaseCost ?? 0)

  async function disableProduct() {
    await onDisable?.(product.sku)
    setActive(false)
    setDialogOpen(false)
    setFeedback(true)
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 lg:flex-row lg:items-end'>
        <ProductImage
          title={product.title}
          imageUrl={product.imageUrl}
          size='lg'
          className='max-w-48'
        />
        <div className='min-w-0 space-y-3'>
          <Button className='-ms-3' onClick={onBack} size='sm' variant='ghost'>
            <ArrowLeft />
            Retour au catalogue
          </Button>
          <div className='flex flex-wrap items-center gap-3'>
            <p className='text-sm font-medium text-muted-foreground'>
              {product.sku} · ISBN {product.isbn ?? '—'}
            </p>
            <ProductStatus
              active={active}
              stock={product.stock}
              threshold={product.threshold}
            />
          </div>
          <div>
            <h2 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              {product.title}
            </h2>
            <p className='mt-1 text-muted-foreground'>
              {product.author} · {product.publisher ?? 'Éditeur non renseigné'}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          {permissions.edit && active ? (
            <Button onClick={() => onEdit(product)} variant='outline'>
              <Pencil />
              Modifier
            </Button>
          ) : null}
          {permissions.disable && active ? (
            <Button onClick={() => setDialogOpen(true)} variant='destructive'>
              <Undo2 />
              Désactiver
            </Button>
          ) : null}
        </div>
      </div>

      {feedback ? (
        <Alert className='border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100'>
          <CheckCircle2 />
          <AlertTitle>Produit désactivé</AlertTitle>
          <AlertDescription>
            Le produit a été désactivé avec succès.
          </AlertDescription>
        </Alert>
      ) : null}

      <section
        aria-label='Indicateurs du produit'
        className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
      >
        {[
          [
            CircleDollarSign,
            'Prix de vente',
            money(product.price),
            `Marge brute : ${money(margin)}`,
          ],
          [
            ShoppingCart,
            'Coût d’achat',
            money(product.purchaseCost ?? 0),
            `Marge : ${product.price ? ((margin / product.price) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : '0'} %`,
          ],
          [
            Archive,
            'Stock actuel',
            `${product.stock} exemplaires`,
            `Mis à jour le ${product.updatedAtLabel ?? '—'}`,
          ],
          [
            PackageCheck,
            'Seuil minimum',
            `${product.threshold} exemplaires`,
            `${product.stock - product.threshold} au-dessus du seuil`,
          ],
        ].map(([Icon, label, value, note]) => (
          <Card
            className={cn(
              label === 'Stock actuel' &&
                product.stock <= product.threshold &&
                'border-amber-300'
            )}
            key={label as string}
          >
            <CardHeader className='pb-0'>
              <div className='flex items-center justify-between'>
                <CardDescription>{label as string}</CardDescription>
                <Icon className='size-4 text-muted-foreground' />
              </div>
              <CardTitle className='text-2xl'>{value as string}</CardTitle>
            </CardHeader>
            <CardContent className='text-xs text-muted-foreground'>
              {note as string}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.5fr_1fr]'>
        <DetailCard
          description='Données de référence du catalogue'
          icon={BookOpen}
          title='Informations bibliographiques'
        >
          <DefinitionList
            items={[
              ['Titre', product.title],
              ['Auteur', product.author],
              ['ISBN', product.isbn],
              ['Éditeur', product.publisher],
              ['Catégorie', product.category],
              ['Langue', product.language],
              ['Description', product.description ?? '—'],
            ]}
          />
        </DetailCard>
        <DetailCard
          description='Approvisionnement principal'
          icon={Truck}
          title='Fournisseur'
        >
          <DefinitionList
            items={[
              ['Fournisseur', product.supplier],
              [
                'Délai habituel',
                `${product.supplierLeadTime ?? '—'} jours calendaires`,
              ],
              ['Dernière réception', '26 août 2026 à 15:20'],
              ['Quantité reçue', '24 exemplaires'],
            ]}
          />
        </DetailCard>
      </section>

      <section className='grid gap-6 xl:grid-cols-2'>
        <DetailCard
          description='312 exemplaires sur les 30 derniers jours'
          icon={TrendingUp}
          title='Ventes récentes'
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Période</TableHead>
                <TableHead className='text-end'>Exemplaires</TableHead>
                <TableHead className='text-end'>Chiffre d’affaires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_SALES.map(([period, quantity, revenue]) => (
                <TableRow key={period}>
                  <TableCell>{period}</TableCell>
                  <TableCell className='text-end'>{quantity}</TableCell>
                  <TableCell className='text-end font-medium'>
                    {revenue}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DetailCard>
        <DetailCard
          description='Derniers mouvements enregistrés'
          icon={Archive}
          title='Mouvements de stock'
        >
          <div className='space-y-1'>
            {INVENTORY_MOVEMENTS.map(
              ([date, label, quantity, balance, tone], index) => {
                const Icon = tone === 'in' ? ArrowDown : ArrowUp
                return (
                  <div key={date}>
                    {index ? <Separator /> : null}
                    <div className='flex items-center gap-3 py-3'>
                      <span
                        className={cn(
                          'rounded-full p-2',
                          tone === 'in'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950'
                        )}
                      >
                        <Icon className='size-4' />
                      </span>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>{label}</p>
                        <p className='text-xs text-muted-foreground'>{date}</p>
                      </div>
                      <div className='text-end'>
                        <Badge variant='outline'>{quantity}</Badge>
                        <p className='mt-1 text-xs text-muted-foreground'>
                          Solde {balance}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }
            )}
          </div>
        </DetailCard>
      </section>

      <section className='grid gap-6 xl:grid-cols-2'>
        <DetailCard
          description='Calculée le 27 août 2026 à 18:00'
          icon={TrendingUp}
          title='Prévision actuelle'
        >
          <div className='grid gap-4 sm:grid-cols-3'>
            {[
              ['Demande prévue', '96', 'exemplaires · 4 semaines'],
              ['Couverture actuelle', '13', 'jours de stock'],
              ['Risque de rupture', 'Élevé', 'dans 14 jours'],
            ].map(([label, value, note]) => (
              <div className='rounded-lg bg-muted/50 p-4' key={label}>
                <p className='text-xs text-muted-foreground'>{label}</p>
                <p
                  className={cn(
                    'mt-1 text-2xl font-bold',
                    label === 'Risque de rupture' && 'text-destructive'
                  )}
                >
                  {value}
                </p>
                <p className='text-xs text-muted-foreground'>{note}</p>
              </div>
            ))}
          </div>
        </DetailCard>
        <DetailCard
          description='Basée sur la prévision et le délai fournisseur'
          icon={PackageCheck}
          title='Recommandation de réapprovisionnement'
        >
          <Alert>
            <Truck />
            <AlertTitle>Commander 90 exemplaires</AlertTitle>
            <AlertDescription>
              Passer la commande avant le <strong>31 août 2026</strong> pour
              maintenir 21 jours de couverture après réception.
            </AlertDescription>
          </Alert>
          <div className='mt-4'>
            <DefinitionList
              items={[
                ['Arrivée estimée', '08 septembre 2026'],
                ['Coût estimé', '4 455,00 MAD'],
              ]}
            />
          </div>
        </DetailCard>
      </section>

      <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{product.title}</strong> ne pourra plus être utilisé dans
              de nouvelles commandes. Son historique sera conservé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={disableProduct}
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
