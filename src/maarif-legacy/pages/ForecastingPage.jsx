import { useState } from 'react'
import {
  Archive,
  BookOpen,
  CheckCircle,
  MagnifyingGlass,
  ShoppingCart,
  TrendUp,
  Truck,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '@/components/ui/command'

function ForecastDemandChart({ product }) {
  return (
    <div
      aria-label={`Demande hebdomadaire historique et prévue pour ${product.title}`}
      className='h-72 w-full min-w-0 sm:h-80'
      role='img'
    >
      <ResponsiveContainer height='100%' minWidth={0} width='100%'>
        <LineChart
          data={product.data}
          margin={{ top: 12, right: 12, bottom: 0, left: -20 }}
        >
          <CartesianGrid stroke='var(--border)' vertical={false} />
          <XAxis
            axisLine={false}
            dataKey='week'
            interval={1}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              backgroundColor: 'var(--popover)',
              color: 'var(--popover-foreground)',
              boxShadow: '0 8px 24px rgba(18, 36, 29, .08)',
              fontSize: 12,
            }}
            formatter={(value, name) => [
              `${value} exemplaires`,
              name === 'actual' ? 'Demande réelle' : 'Demande prévue',
            ]}
            labelStyle={{ color: 'var(--popover-foreground)', fontWeight: 700 }}
          />
          <Line
            connectNulls={false}
            dataKey='actual'
            dot={{ fill: 'var(--chart-1)', r: 2.5 }}
            isAnimationActive={false}
            name='actual'
            stroke='var(--chart-1)'
            strokeWidth={2.25}
            type='linear'
          />
          <Line
            dataKey='predicted'
            dot={{ fill: 'var(--chart-2)', r: 2.5 }}
            isAnimationActive={false}
            name='predicted'
            stroke='var(--chart-2)'
            strokeDasharray='6 4'
            strokeWidth={2.25}
            type='linear'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ForecastingPage({ products }) {
  const [query, setQuery] = useState('')
  const [selectedSku, setSelectedSku] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  if (!products.length) {
    return (
      <div className='flex min-w-0 flex-col gap-6'>
        <Card className='p-6'>
          <CardTitle>Aucune prévision disponible.</CardTitle>
        </Card>
      </div>
    )
  }
  const selectedProduct =
    products.find((item) => item.sku === selectedSku) ?? products[0]
  const matchingProducts = products.filter((item) =>
    `${item.title} ${item.author} ${item.sku}`
      .toLocaleLowerCase('fr')
      .includes(query.trim().toLocaleLowerCase('fr'))
  )

  const chooseProduct = (product) => {
    setSelectedSku(product.sku)
    setQuery('')
    setSearchOpen(false)
  }

  return (
    <div className='flex min-w-0 flex-col gap-6'>
      <Card aria-label='Sélection du produit' className='gap-4 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-3 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-sm [&_p]:text-muted-foreground [&>span]:text-xs [&>span]:text-muted-foreground'>
          <div>
            <p>Analyse de la demande</p>
            <h2>Prévision par produit</h2>
          </div>
          <span>Prévisions disponibles sur le serveur</span>
        </div>
        <div className='max-w-xl space-y-2'>
          <label
            htmlFor='forecast-product-search'
            className='text-sm font-medium'
          >
            Rechercher un produit
          </label>
          <Command
            shouldFilter={false}
            className='overflow-hidden rounded-lg border'
          >
            <CommandInput
              id='forecast-product-search'
              placeholder='Titre, auteur ou SKU'
              value={query}
              onValueChange={(value) => {
                setQuery(value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
            />
            {searchOpen && query && (
              <CommandList>
                <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                {matchingProducts.map((product) => (
                  <CommandItem
                    key={product.sku}
                    value={product.sku}
                    onSelect={() => chooseProduct(product)}
                    className='gap-3 py-3'
                  >
                    <BookOpen />
                    <span>
                      <span className='block font-medium'>{product.title}</span>
                      <span className='text-xs text-muted-foreground'>
                        {product.author} · {product.sku}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandList>
            )}
          </Command>
        </div>
      </Card>

      <Card
        aria-labelledby='forecast-product-title'
        className='flex-row flex-wrap items-center gap-4 p-6 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground [&_span]:text-sm'
      >
        <span className='flex size-12 items-center justify-center rounded-lg bg-muted [&>svg]:size-6'>
          <BookOpen aria-hidden='true' weight='fill' />
        </span>
        <div>
          <p>{selectedProduct.sku}</p>
          <h2 id='forecast-product-title'>{selectedProduct.title}</h2>
          <span>
            {selectedProduct.author} · {selectedProduct.category}
          </span>
        </div>
        <Badge className='bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'>
          Produit actif
        </Badge>
      </Card>

      <section className='grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'>
        <Card className='min-w-0 gap-4 p-6'>
          <CardHeader className='flex flex-wrap items-start justify-between gap-3 p-0 has-[>svg]:justify-start [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5 [&>span]:text-xs [&>span]:text-muted-foreground'>
            <div>
              <CardTitle>Demande hebdomadaire</CardTitle>
              <p>Historique observé et prévision sur 4 semaines</p>
            </div>
            <div className='flex items-center gap-4 text-xs [&_i]:size-2 [&_i]:rounded-full [&>span]:flex [&>span]:items-center [&>span]:gap-2'>
              <span>
                <i className='bg-chart-1' />
                Réelle
              </span>
              <span>
                <i className='bg-chart-2' />
                Prévue
              </span>
            </div>
          </CardHeader>
          {selectedProduct.data.length ? (
            <ForecastDemandChart product={selectedProduct} />
          ) : (
            <p className='rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground'>
              La série temporelle historique et prévue n’est pas encore fournie
              par l’API. La quantité prévue reste disponible ci-contre.
            </p>
          )}
        </Card>

        <Card className='gap-4 p-6 [&_dd]:font-medium [&_dl]:space-y-4 [&_dt]:text-sm [&_dt]:text-muted-foreground'>
          <CardHeader className='flex flex-wrap items-start justify-between gap-3 p-0 has-[>svg]:justify-start [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5 [&>span]:text-xs [&>span]:text-muted-foreground'>
            <TrendUp aria-hidden='true' />
            <div>
              <CardTitle>Prévision actuelle</CardTitle>
              <p>Modèle retenu pour ce produit</p>
            </div>
          </CardHeader>
          <dl>
            <div>
              <dt>Méthode sélectionnée</dt>
              <dd>{selectedProduct.method}</dd>
            </div>
            <div className='rounded-lg bg-muted p-4 [&_dd]:text-3xl [&_dd]:font-bold [&_small]:block [&_small]:text-xs [&_small]:font-normal [&_small]:text-muted-foreground'>
              <dt>Quantité prévue</dt>
              <dd>
                {selectedProduct.predictedQuantity}{' '}
                <small>exemplaires / 4 semaines</small>
              </dd>
            </div>
            <div>
              <dt>{selectedProduct.metricLabel}</dt>
              <dd>{selectedProduct.metricValue}</dd>
            </div>
            <div>
              <dt>Date de génération</dt>
              <dd>{selectedProduct.generatedAt}</dd>
            </div>
          </dl>
        </Card>
      </section>

      <section
        aria-label='Hypothèses et limites'
        className='grid gap-6 md:grid-cols-2'
      >
        <Card className='gap-4 p-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:text-muted-foreground'>
          <CardHeader className='flex flex-wrap items-start justify-between gap-3 p-0 has-[>svg]:justify-start [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5 [&>span]:text-xs [&>span]:text-muted-foreground'>
            <CheckCircle aria-hidden='true' />
            <CardTitle>Hypothèses</CardTitle>
          </CardHeader>
          <ul>
            <li>
              Les ventes des 12 dernières semaines reflètent la demande
              habituelle.
            </li>
            <li>Les prix et la disponibilité commerciale restent stables.</li>
            <li>Aucune promotion exceptionnelle n’est planifiée.</li>
          </ul>
        </Card>
        <Card className='gap-4 p-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:text-muted-foreground'>
          <CardHeader className='flex flex-wrap items-start justify-between gap-3 p-0 has-[>svg]:justify-start [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5 [&>span]:text-xs [&>span]:text-muted-foreground'>
            <WarningCircle aria-hidden='true' />
            <CardTitle>Limites</CardTitle>
          </CardHeader>
          <ul>
            <li>
              Les ruptures passées peuvent sous-estimer la demande réelle.
            </li>
            <li>
              Les événements scolaires et saisonniers ne sont pas modélisés
              séparément.
            </li>
            <li>
              La prévision doit être revue après toute variation inhabituelle.
            </li>
          </ul>
        </Card>
      </section>

      <Card aria-labelledby='reorder-title' className='gap-6 p-6'>
        <CardHeader className='flex flex-wrap items-start justify-between gap-3 p-0 has-[>svg]:justify-start [&_p]:text-sm [&_p]:text-muted-foreground [&_svg]:size-5 [&>span]:text-xs [&>span]:text-muted-foreground'>
          <div>
            <p>Décision de réapprovisionnement</p>
            <CardTitle id='reorder-title'>Recommandation de stock</CardTitle>
          </div>
          <span>Fournisseur : {selectedProduct.supplier}</span>
        </CardHeader>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5 [&_small]:text-xs [&_small]:text-muted-foreground [&_span]:text-sm [&_span]:text-muted-foreground [&_strong]:text-2xl [&_strong]:font-bold [&_svg]:size-5 [&_svg]:text-muted-foreground [&>div]:gap-2 [&>div]:p-4'>
          <Card>
            <Archive aria-hidden='true' />
            <span>Stock actuel</span>
            <strong>{selectedProduct.currentStock}</strong>
            <small>exemplaires disponibles</small>
          </Card>
          <Card>
            <Truck aria-hidden='true' />
            <span>Délai fournisseur</span>
            <strong>{selectedProduct.leadTime}</strong>
            <small>délai habituel</small>
          </Card>
          <Card>
            <Warning aria-hidden='true' />
            <span>Stock de sécurité</span>
            <strong>{selectedProduct.safetyStock}</strong>
            <small>exemplaires</small>
          </Card>
          <Card>
            <TrendUp aria-hidden='true' />
            <span>Point de commande</span>
            <strong>{selectedProduct.reorderPoint}</strong>
            <small>exemplaires</small>
          </Card>
          <Card className='border-primary/30 bg-primary/5'>
            <ShoppingCart aria-hidden='true' weight='fill' />
            <span>Quantité recommandée</span>
            <strong>{selectedProduct.recommendedQuantity}</strong>
            <small>
              {selectedProduct.recommendedQuantity
                ? 'exemplaires à réapprovisionner'
                : 'aucun réapprovisionnement requis'}
            </small>
          </Card>
        </div>
        <div
          className='flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground [&_svg]:size-5 [&_svg]:shrink-0'
          role='note'
        >
          <WarningCircle aria-hidden='true' weight='fill' />
          <p>
            <strong>Recommandation informative uniquement.</strong> Elle ne crée
            pas automatiquement de commande fournisseur.
          </p>
        </div>
      </Card>
    </div>
  )
}
