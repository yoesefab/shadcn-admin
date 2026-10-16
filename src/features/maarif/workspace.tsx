import { useEffect, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { AdministrationPage } from '@/maarif-legacy/pages/AdministrationPage.jsx'
import { DashboardContent } from '@/maarif-legacy/pages/DashboardPage.jsx'
import { ForecastingPage } from '@/maarif-legacy/pages/ForecastingPage.jsx'
import { ImportHistoryPage } from '@/maarif-legacy/pages/ImportHistoryPage.jsx'
import { InventoryManagement } from '@/maarif-legacy/pages/InventoryPage.jsx'
import { LogsPage } from '@/maarif-legacy/pages/LogsPage.jsx'
import { OrderDetailsPage } from '@/maarif-legacy/pages/OrderDetailsPage.jsx'
import { OrdersManagement } from '@/maarif-legacy/pages/OrdersPage.jsx'
import { ReportsPage } from '@/maarif-legacy/pages/ReportsPage.jsx'
import { SalesImportPage } from '@/maarif-legacy/pages/SalesImportPage.jsx'
import { StockAlertsPage } from '@/maarif-legacy/pages/StockAlertsPage.jsx'
import { SystemStatePage } from '@/maarif-legacy/pages/SystemStatePage.jsx'
import { Bell, CalendarDays } from 'lucide-react'
import { administrationApi } from '@/api/administration-api'
import { alertsApi } from '@/api/alerts-api'
import { dashboardApi } from '@/api/dashboard-api'
import { forecastingApi } from '@/api/forecasting-api'
import { importsApi } from '@/api/imports-api'
import { inventoryApi } from '@/api/inventory-api'
import { ordersApi } from '@/api/orders-api'
import { productsApi } from '@/api/products-api'
import { reportsApi } from '@/api/reports-api'
import { cn } from '@/lib/utils'
import { useSession } from '@/context/session-provider'
import { useOpenAlertCount } from '@/hooks/use-open-alert-count'
import { Button } from '@/components/ui/button'
import { DateRangePicker, type DateRange } from '@/components/date-range-picker'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  loadInventoryHistory,
  loadOrders,
  loadProductFormReferences,
  loadProducts,
  mapAlert,
  mapAudit,
  mapImport,
  mapMovement,
  mapRecommendation,
  movementTypes,
  productRequest,
} from './backend-adapters'
import { ProductCreateDialog } from './product-create-dialog'
import { ProductDetails } from './product-details'
import { ProductCatalog } from './products-catalog'
import { UserManagement } from './user-management'

type PageFrameProps = {
  children: ReactNode
  className?: string
  eyebrow?: string
  headerActions?: ReactNode
  nativeLayout?: boolean
  title: string
}

type ProductReference = { id?: number; sku: string }
type OrderReference = { backendId?: number; reference: string }
type InventoryRecordRequest = {
  movementType: string
  quantity: number
  reason: string
  product?: ProductReference
}
type AlertRecord = ReturnType<typeof mapAlert>
type SystemSettings = {
  forecastHistoryWeeks: string
  safetyStock: string
}

const roleLabel = {
  ADMINISTRATOR: 'Administrateur',
  MANAGER: 'Gestionnaire',
  STOCK_EMPLOYEE: 'Employé de stock',
} as const

function PageFrame({
  children,
  className = 'app-content--catalog',
  eyebrow = 'Maarif Analytics',
  headerActions,
  nativeLayout = false,
  title,
}: PageFrameProps) {
  const openAlerts = useOpenAlertCount()
  useEffect(() => {
    document.title = `${title} — Maarif Analytics`
  }, [title])

  return (
    <>
      <Header fixed className='border-b bg-background/95'>
        <div className={cn('min-w-0', headerActions && 'max-md:hidden')}>
          <p className='truncate text-[0.65rem] font-bold tracking-[0.16em] text-emerald-700 uppercase'>
            {eyebrow}
          </p>
          <h1 className='truncate text-base font-semibold tracking-tight sm:text-lg'>
            {title}
          </h1>
        </div>
        <div className='ms-auto flex items-center gap-1.5'>
          {headerActions}
          <div className='hidden items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground lg:flex'>
            <CalendarDays className='size-3.5' />
            Africa/Casablanca
          </div>
          <Button
            asChild
            aria-label={
              openAlerts.data === undefined
                ? 'Alertes de stock'
                : `${openAlerts.data} alertes de stock`
            }
            className='relative'
            size='icon'
            variant='ghost'
          >
            <Link to='/alerts'>
              <Bell />
              {!!openAlerts.data && (
                <span className='absolute end-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[0.6rem] font-bold text-white'>
                  {openAlerts.data}
                </span>
              )}
            </Link>
          </Button>
          <ThemeSwitch />
        </div>
      </Header>
      <Main
        fluid={!nativeLayout}
        className={
          nativeLayout
            ? 'flex flex-1 flex-col gap-4 sm:gap-6'
            : cn('app-content maarif-route-content', className)
        }
      >
        {children}
      </Main>
    </>
  )
}

export function DashboardWorkspace() {
  const [period, setPeriod] = useState<DateRange>({
    from: new Date(2025, 8, 1),
    to: new Date(2026, 7, 27),
  })
  const dashboard = useQuery({
    queryKey: [
      'dashboard',
      period.from?.toISOString(),
      period.to?.toISOString(),
    ],
    queryFn: ({ signal }) => {
      const end = new Date(period.to ?? period.from ?? new Date())
      end.setHours(23, 59, 59, 999)
      return dashboardApi.get(
        {
          start: (period.from ?? new Date()).toISOString(),
          end: end.toISOString(),
        },
        signal
      )
    },
    placeholderData: {
      totalRevenue: 0,
      numberOfOrders: 0,
      unitsSold: 0,
      averageOrderValue: 0,
      currentStockQuantity: 0,
      inventoryValue: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      stockTurnover: 0,
      estimatedDaysRemaining: 0,
      bestsellingProducts: [],
      slowMovingProducts: [],
      salesByCategory: [],
      salesByLanguage: [],
      revenueTrend: [],
    },
  })

  return (
    <PageFrame
      nativeLayout
      headerActions={
        <div className='navbar-period-picker w-[105px] shrink-0 sm:w-[190px] lg:w-[210px]'>
          <DateRangePicker
            initialDateFrom={new Date(2025, 8, 1)}
            initialDateTo={new Date(2026, 7, 27)}
            locale='fr-MA'
            onUpdate={setPeriod}
          />
        </div>
      }
      title='Tableau de bord'
    >
      <DashboardContent dashboard={dashboard.data} />
    </PageFrame>
  )
}

export function ProductsWorkspace({
  initialCreate = false,
  initialEditSku,
}: { initialCreate?: boolean; initialEditSku?: string } = {}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useSession()
  const products = useQuery({
    queryKey: ['products', 'workspace'],
    queryFn: ({ signal }) => loadProducts(signal),
  })
  const [createOpen, setCreateOpen] = useState(initialCreate)
  const [editSku, setEditSku] = useState(initialEditSku)
  const productReferences = useQuery({
    queryKey: ['catalog', 'product-form'],
    queryFn: ({ signal }) => loadProductFormReferences(signal),
    enabled: createOpen || Boolean(editSku),
    retry: false,
  })
  const closeCreate = () => {
    setCreateOpen(false)
    if (initialCreate) void navigate({ to: '/products', replace: true })
  }
  const closeEdit = () => {
    setEditSku(undefined)
    void navigate({ to: '/products', replace: true })
  }
  const editedProduct = products.data?.find(
    (product) => product.sku === editSku
  )
  return (
    <PageFrame title='Produits' nativeLayout>
      {products.isPending ? (
        <p role='status'>Chargement des produits…</p>
      ) : products.isError ? (
        <p role='alert'>Impossible de charger les produits.</p>
      ) : (
        <ProductCatalog
          role={user ? roleLabel[user.role] : 'Gestionnaire'}
          products={products.data}
          onDisableProducts={async (selected) => {
            await Promise.all(
              selected
                .filter((product) => product.id != null)
                .map((product) => productsApi.deactivate(product.id as number))
            )
            await queryClient.invalidateQueries({ queryKey: ['products'] })
          }}
          onCreate={() => setCreateOpen(true)}
          onEdit={(product: ProductReference) => {
            setEditSku(product.sku)
            void navigate({
              to: '/products/$sku/edit',
              params: { sku: product.sku },
            })
          }}
          onView={(product: ProductReference) =>
            navigate({ to: '/products/$sku', params: { sku: product.sku } })
          }
        />
      )}
      {!products.isPending &&
      !products.isError &&
      (createOpen || editedProduct) &&
      productReferences.isPending ? (
        <p role='status'>Chargement des référentiels du produit…</p>
      ) : null}
      {!products.isPending &&
      !products.isError &&
      (createOpen || editedProduct) &&
      productReferences.isError ? (
        <div role='alert'>
          <p>Impossible de charger les catégories, éditeurs et fournisseurs.</p>
          <Button
            type='button'
            onClick={() => void productReferences.refetch()}
          >
            Réessayer
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={createOpen ? closeCreate : closeEdit}
          >
            Fermer
          </Button>
        </div>
      ) : null}
      {!products.isPending &&
        !products.isError &&
        createOpen &&
        productReferences.isSuccess && (
          <ProductCreateDialog
            existingSkus={products.data?.map((item) => item.sku) ?? []}
            references={productReferences.data}
            onReloadReferences={() => void productReferences.refetch()}
            onClose={closeCreate}
            onCreate={async (values, image) => {
              const created = await productsApi.create(
                productRequest(values, productReferences.data)
              )
              if (image instanceof File)
                await productsApi.uploadImage(created.id, image)
              await queryClient.invalidateQueries({ queryKey: ['products'] })
            }}
          />
        )}
      {!products.isPending &&
        !products.isError &&
        editedProduct &&
        productReferences.isSuccess && (
          <ProductCreateDialog
            existingSkus={products.data?.map((item) => item.sku) ?? []}
            references={productReferences.data}
            onReloadReferences={() => void productReferences.refetch()}
            product={editedProduct}
            onClose={closeEdit}
            onCreate={async (values, image) => {
              if (editedProduct.id == null) return
              await productsApi.update(
                editedProduct.id,
                productRequest(values, productReferences.data)
              )
              if (image instanceof File)
                await productsApi.uploadImage(editedProduct.id, image)
              else if (image === null)
                await productsApi.removeImage(editedProduct.id)
              await queryClient.invalidateQueries({ queryKey: ['products'] })
            }}
          />
        )}
    </PageFrame>
  )
}

export function ProductEditorWorkspace({ sku }: { sku?: string }) {
  return <ProductsWorkspace initialEditSku={sku} />
}

export function ProductDetailsWorkspace({ sku }: { sku: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useSession()
  const products = useQuery({
    queryKey: ['products', 'workspace'],
    queryFn: ({ signal }) => loadProducts(signal),
  })
  if (products.isPending)
    return (
      <PageFrame title='Détails du produit'>
        <p role='status'>Chargement du produit…</p>
      </PageFrame>
    )
  if (products.isError)
    return (
      <PageFrame title='Détails du produit'>
        <p role='alert'>Impossible de charger le produit.</p>
      </PageFrame>
    )
  const product = products.data.find((item) => item.sku === sku)
  if (!product)
    return (
      <PageFrame title='Détails du produit'>
        <p role='alert'>Produit introuvable.</p>
        <Link to='/products'>Retour aux produits</Link>
      </PageFrame>
    )
  return (
    <PageFrame title='Détails du produit'>
      <ProductDetails
        role={user ? roleLabel[user.role] : 'Gestionnaire'}
        onBack={() => navigate({ to: '/products' })}
        onDisable={async () => {
          if (product.id) await productsApi.deactivate(product.id)
          await queryClient.invalidateQueries({ queryKey: ['products'] })
        }}
        onEdit={(item: ProductReference) =>
          navigate({
            to: '/products/$sku/edit',
            params: { sku: item.sku },
          })
        }
        product={product}
      />
    </PageFrame>
  )
}

export function InventoryWorkspace() {
  const queryClient = useQueryClient()
  const products = useQuery({
    queryKey: ['products', 'workspace'],
    queryFn: ({ signal }) => loadProducts(signal),
  })
  const history = useQuery({
    queryKey: ['inventory', 'history', products.data?.map((item) => item.id)],
    queryFn: () => loadInventoryHistory(products.data ?? []),
    enabled: Boolean(products.data),
  })
  return (
    <PageFrame title='Inventaire' nativeLayout>
      {products.isPending || history.isPending ? (
        <p role='status'>Chargement de l’inventaire…</p>
      ) : products.isError || history.isError ? (
        <p role='alert'>Impossible de charger l’inventaire.</p>
      ) : (
        <InventoryManagement
          inventoryData={products.data}
          historyData={history.data}
          onRecordMovement={async ({
            movementType,
            quantity,
            reason,
            product,
          }: InventoryRecordRequest) => {
            if (!product?.id) throw new Error('Produit introuvable')
            const created = await inventoryApi.record({
              productId: product.id,
              type: movementTypes[movementType],
              quantity,
              reason,
            })
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['products'] }),
              queryClient.invalidateQueries({ queryKey: ['inventory'] }),
            ])
            return mapMovement(created)
          }}
        />
      )}
    </PageFrame>
  )
}

export function OrdersWorkspace() {
  const navigate = useNavigate()
  const orders = useQuery({
    queryKey: ['orders', 'workspace'],
    queryFn: ({ signal }) => loadOrders(signal),
  })
  return (
    <PageFrame title='Commandes' nativeLayout>
      {orders.isPending ? (
        <p role='status'>Chargement des commandes…</p>
      ) : orders.isError ? (
        <p role='alert'>Impossible de charger les commandes.</p>
      ) : (
        <OrdersManagement
          orders={orders.data}
          onView={(order: OrderReference) =>
            navigate({
              to: '/orders/$reference',
              params: { reference: order.reference },
            })
          }
        />
      )}
    </PageFrame>
  )
}

export function OrderDetailsWorkspace({ reference }: { reference: string }) {
  const { user } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const orders = useQuery({
    queryKey: ['orders', 'workspace'],
    queryFn: ({ signal }) => loadOrders(signal),
  })
  if (orders.isPending)
    return (
      <PageFrame title='Détails de la commande' nativeLayout>
        <p role='status'>Chargement de la commande…</p>
      </PageFrame>
    )
  if (orders.isError)
    return (
      <PageFrame title='Détails de la commande' nativeLayout>
        <p role='alert'>Impossible de charger la commande.</p>
      </PageFrame>
    )
  const order = orders.data.find((item) => item.reference === reference)
  if (!order)
    return (
      <PageFrame title='Détails de la commande' nativeLayout>
        <p role='alert'>Commande introuvable.</p>
        <Link to='/orders'>Retour aux commandes</Link>
      </PageFrame>
    )
  return (
    <PageFrame title='Détails de la commande' nativeLayout>
      <OrderDetailsPage
        key={order.reference}
        role={user ? roleLabel[user.role] : ''}
        onBack={() => navigate({ to: '/orders' })}
        onCancelOrder={async () => {
          if (order.backendId)
            await ordersApi.setStatus(order.backendId, 'CANCELLED')
          await queryClient.invalidateQueries({ queryKey: ['orders'] })
        }}
        order={order}
      />
    </PageFrame>
  )
}

export function ImportsWorkspace() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return (
    <PageFrame title='Imports de ventes' nativeLayout>
      <SalesImportPage
        onPreview={(file: File) => importsApi.preview(file)}
        onConfirm={async (preview: { id?: number } | null) => {
          if (!preview?.id) throw new Error('Import introuvable')
          const result = await importsApi.confirm(preview.id)
          await queryClient.invalidateQueries({ queryKey: ['imports'] })
          return result
        }}
        onOpenHistory={() => navigate({ to: '/imports/history' })}
      />
    </PageFrame>
  )
}

export function ImportHistoryWorkspace() {
  const imports = useQuery({
    queryKey: ['imports'],
    queryFn: ({ signal }) => importsApi.list(0, signal),
  })
  if (imports.isPending || imports.isError) {
    return (
      <PageFrame title='Historique des imports' nativeLayout>
        <p role={imports.isError ? 'alert' : 'status'}>
          {imports.isError
            ? 'Impossible de charger l’historique des imports.'
            : 'Chargement de l’historique des imports…'}
        </p>
      </PageFrame>
    )
  }
  return (
    <PageFrame title='Historique des imports' nativeLayout>
      <ImportHistoryPage
        imports={imports.data.content.map(mapImport)}
        onDownloadErrors={async (item: { backendId: number; id: string }) => {
          const response = await importsApi.errors(item.backendId)
          const url = URL.createObjectURL(await response.blob())
          const link = document.createElement('a')
          link.href = url
          link.download = `rapport_erreurs_${item.id.toLowerCase()}.csv`
          link.click()
          window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        }}
      />
    </PageFrame>
  )
}

export function AlertsWorkspace() {
  const queryClient = useQueryClient()
  const alerts = useQuery({
    queryKey: ['alerts'],
    queryFn: ({ signal }) => alertsApi.list(undefined, undefined, 0, signal),
  })
  return (
    <PageFrame title='Alertes de stock' nativeLayout>
      <StockAlertsPage
        alertData={alerts.data?.content.map(mapAlert) ?? []}
        onUpdate={async (selected: AlertRecord[], nextStatus: string) => {
          await Promise.all(
            selected.map((alert) =>
              nextStatus === 'Résolue'
                ? alertsApi.resolve(alert.backendId)
                : alertsApi.acknowledge(alert.backendId)
            )
          )
          await queryClient.invalidateQueries({ queryKey: ['alerts'] })
        }}
      />
    </PageFrame>
  )
}

export function ForecastingWorkspace() {
  const recommendations = useQuery({
    queryKey: ['forecasting', 'recommendations'],
    queryFn: ({ signal }) =>
      forecastingApi.recommendations(undefined, 0, signal),
  })
  if (recommendations.isPending || recommendations.isError) {
    return (
      <PageFrame title='Prévisions' nativeLayout>
        <p role={recommendations.isError ? 'alert' : 'status'}>
          {recommendations.isError
            ? 'Impossible de charger les prévisions.'
            : 'Chargement des prévisions…'}
        </p>
      </PageFrame>
    )
  }
  return (
    <PageFrame title='Prévisions' nativeLayout>
      <ForecastingPage
        products={recommendations.data.content.map(mapRecommendation)}
      />
    </PageFrame>
  )
}

export function ReportsWorkspace() {
  const download = async (response: Response, fallbackName: string) => {
    const blob = await response.blob()
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const disposition = response.headers.get('content-disposition')
    link.href = href
    link.download =
      disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? fallbackName
    link.click()
    URL.revokeObjectURL(href)
  }
  return (
    <PageFrame title='Rapports' nativeLayout>
      <ReportsPage
        onExport={async ({
          format,
          reportId,
        }: {
          format: string
          reportId: string
        }) => {
          if (format === 'PDF') {
            const response = await reportsApi.management({
              start: new Date('2026-08-01T00:00:00+01:00').toISOString(),
              end: new Date('2026-08-27T23:59:59+01:00').toISOString(),
            })
            await download(response, 'rapport-gestion.pdf')
            return
          }
          if (reportId === 'sales' || reportId === 'management') {
            const orders = await loadOrders()
            const escape = (value: unknown) =>
              `"${String(value ?? '').replace(/"/g, '""')}"`
            const csv = [
              [
                'Référence',
                'Date',
                'Statut',
                'Source',
                'Ville',
                'Articles',
                'Total',
              ],
              ...orders.map((order) => [
                order.reference,
                order.isoDate,
                order.status,
                order.source,
                order.city,
                order.itemCount,
                order.total,
              ]),
            ]
              .map((row) => row.map(escape).join(','))
              .join('\n')
            await download(
              new Response(csv, {
                headers: { 'content-type': 'text/csv;charset=utf-8' },
              }),
              'rapport-ventes.csv'
            )
            return
          }
          const path =
            reportId === 'low-stock'
              ? 'low-stock.csv'
              : reportId === 'reorder'
                ? 'reorder-recommendations.csv'
                : 'inventory.csv'
          await download(await reportsApi.download(path), path)
        }}
      />
    </PageFrame>
  )
}

export function AdministrationWorkspace() {
  const queryClient = useQueryClient()
  const settings = useQuery({
    queryKey: ['administration', 'settings'],
    queryFn: ({ signal }) => administrationApi.settings(signal),
  })
  const byKey = new Map(settings.data?.map((setting) => [setting.key, setting]))
  return (
    <PageFrame title='Administration' nativeLayout>
      <AdministrationPage
        settings={
          settings.data
            ? {
                forecastHistoryWeeks: byKey.get(
                  'forecast.minimum_history_weeks'
                )?.value,
                safetyStock: byKey.get('forecast.safety_stock_days')?.value,
              }
            : undefined
        }
        onSave={async (values: SystemSettings) => {
          await Promise.all([
            administrationApi.updateSetting(
              'forecast.minimum_history_weeks',
              values.forecastHistoryWeeks,
              byKey.get('forecast.minimum_history_weeks')?.description ??
                undefined
            ),
            administrationApi.updateSetting(
              'forecast.safety_stock_days',
              values.safetyStock,
              byKey.get('forecast.safety_stock_days')?.description ?? undefined
            ),
          ])
          await queryClient.invalidateQueries({
            queryKey: ['administration', 'settings'],
          })
        }}
      />
    </PageFrame>
  )
}

export function LogsWorkspace() {
  const audit = useQuery({
    queryKey: ['administration', 'audit'],
    queryFn: ({ signal }) => administrationApi.audit(0, signal),
  })
  return (
    <PageFrame title='Logs' nativeLayout>
      <LogsPage auditEvents={audit.data?.content.map(mapAudit) ?? []} />
    </PageFrame>
  )
}

export function UnauthorizedWorkspace() {
  const navigate = useNavigate()
  return (
    <PageFrame className='app-content--system-state' title='Accès non autorisé'>
      <SystemStatePage
        onNavigate={() => navigate({ to: '/products' })}
        type='unauthorized'
      />
    </PageFrame>
  )
}

export function UsersWorkspace() {
  return (
    <PageFrame title='Utilisateurs' nativeLayout>
      <UserManagement />
    </PageFrame>
  )
}
