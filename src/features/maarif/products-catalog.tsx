import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  CATALOG_PERMISSIONS,
  formatMad,
} from '@/maarif-legacy/shared/catalogData.js'
import {
  CheckCircle,
  CircleOff,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Ban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { DataTableFrenchProvider } from '@/components/data-table/locale'
import { StatusBadge } from '@/features/maarif/status-badge'
import { ProductImage } from './product-image'
import { ProductsBulkActions } from './products-bulk-actions'

export type Product = {
  sku: string
  title: string
  author: string
  category: string
  language: string
  price: number
  stock: number
  threshold: number
  active: boolean
  id?: number
  imageUrl?: string | null
}
type ProductCatalogProps = {
  products: Product[]
  onDisableProducts?: (products: Product[]) => Promise<void>
  onCreate: () => void
  onEdit: (product: Product) => void
  onView: (product: Product) => void
  role?: keyof typeof CATALOG_PERMISSIONS
}

const columnLabels = {
  sku: 'SKU',
  title: 'Produit',
  author: 'Auteur',
  category: 'Catégorie',
  language: 'Langue',
  price: 'Prix (MAD)',
  stock: 'Stock',
  active: 'Statut',
}

export function ProductCatalog({
  products,
  onDisableProducts,
  onCreate,
  onEdit,
  onView,
  role = 'Gestionnaire',
}: ProductCatalogProps) {
  const permissions = CATALOG_PERMISSIONS[role]
  const [pendingDisable, setPendingDisable] = useState<Product | null>(null)
  const [disabledSkus, setDisabledSkus] = useState<string[]>([])
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    category: false,
    author: false,
  })
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const disableProducts = async (selected: Product[]) => {
    await onDisableProducts?.(selected)
    setDisabledSkus((current) => [
      ...new Set([...current, ...selected.map((product) => product.sku)]),
    ])
  }
  const data = useMemo(
    () =>
      products.map((product) =>
        disabledSkus.includes(product.sku)
          ? { ...product, active: false }
          : product
      ),
    [disabledSkus, products]
  )

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Sélectionner la page'
            className='translate-y-0.5'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Sélectionner ${row.original.title}`}
            className='translate-y-0.5'
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'sku',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='SKU' />
        ),
        cell: ({ row }) => <div className='w-24'>{row.original.sku}</div>,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Produit' />
        ),
        meta: { className: '' },
        cell: ({ row }) => (
          <div className='flex items-center space-x-2'>
            <ProductImage
              title={row.original.title}
              imageUrl={row.original.imageUrl}
            />
            <Badge variant='outline'>{row.original.category}</Badge>
            <span
              className='max-w-72 truncate font-medium'
              title={row.original.title}
              lang={row.original.language === 'Arabe' ? 'ar' : undefined}
              dir={row.original.language === 'Arabe' ? 'rtl' : undefined}
            >
              {row.original.title}
            </span>
          </div>
        ),
        enableHiding: false,
      },
      ...(['author', 'category', 'language'] as const).map(
        (key) =>
          ({
            accessorKey: key,
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={columnLabels[key]}
                className={
                  key === 'language' ? 'w-full justify-center' : undefined
                }
              />
            ),
            meta: { className: key === 'language' ? 'text-center' : '' },
            filterFn: (row, id, value: string[]) =>
              value.includes(row.getValue(id)),
          }) satisfies ColumnDef<Product>
      ),
      ...(['price', 'stock'] as const).map(
        (key) =>
          ({
            accessorKey: key,
            header: ({ column }) => (
              <DataTableColumnHeader
                column={column}
                title={columnLabels[key]}
                className='w-full justify-center'
              />
            ),
            meta: { className: 'text-center' },
            cell: ({ row }) => (
              <span
                className={cn(
                  'tabular-nums',
                  key === 'stock' &&
                    row.original.stock <= row.original.threshold &&
                    'font-medium text-destructive'
                )}
              >
                {key === 'price'
                  ? formatMad(row.original.price)
                  : row.original[key]}
              </span>
            ),
          }) satisfies ColumnDef<Product>
      ),
      {
        id: 'active',
        accessorFn: (product) => (product.active ? 'active' : 'disabled'),
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title='Statut'
            className='w-full justify-center'
          />
        ),
        meta: { className: 'text-center' },
        cell: ({ row }) => (
          <StatusBadge status={row.original.active ? 'Actif' : 'Désactivé'}>
            {row.original.active ? (
              <CheckCircle data-icon='inline-start' aria-hidden='true' />
            ) : (
              <CircleOff data-icon='inline-start' aria-hidden='true' />
            )}
            {row.original.active ? 'Actif' : 'Désactivé'}
          </StatusBadge>
        ),
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
              >
                <MoreHorizontal className='size-4' />
                <span className='sr-only'>
                  Actions pour {row.original.title}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-40'>
              {permissions.view && (
                <DropdownMenuItem onClick={() => onView(row.original)}>
                  <Eye />
                  Voir
                </DropdownMenuItem>
              )}
              {permissions.edit && row.original.active && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Pencil />
                  Modifier
                </DropdownMenuItem>
              )}
              {permissions.disable && row.original.active && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant='destructive'
                    onClick={() => setPendingDisable(row.original)}
                  >
                    <Ban />
                    Désactiver
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onView, permissions]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    getRowId: (row) => row.sku,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value: string) =>
      [row.original.sku, row.original.title, row.original.author].some((item) =>
        item
          .toLocaleLowerCase('fr')
          .includes(value.trim().toLocaleLowerCase('fr'))
      ),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <DataTableFrenchProvider columnLabels={columnLabels}>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Produits</h2>
          <p className='text-muted-foreground'>
            Consultez et gérez les produits de votre catalogue.
          </p>
        </div>
        {permissions.create && (
          <Button onClick={onCreate}>
            <Plus />
            Créer un produit
          </Button>
        )}
      </div>

      <div
        className={cn(
          'flex flex-1 flex-col gap-4',
          table.getFilteredSelectedRowModel().rows.length > 0 && 'pb-20'
        )}
      >
        <DataTableToolbar
          table={table}
          searchPlaceholder='Rechercher par SKU, titre ou auteur…'
          filters={[
            {
              columnId: 'category',
              title: 'Catégorie',
              options: [
                ...new Set(data.map((product) => product.category)),
              ].map((value) => ({ label: value, value })),
            },
            {
              columnId: 'language',
              title: 'Langue',
              options: [
                ...new Set(data.map((product) => product.language)),
              ].map((value) => ({ label: value, value })),
            },
            {
              columnId: 'active',
              title: 'Statut',
              options: [
                { label: 'Actif', value: 'active', icon: CheckCircle },
                { label: 'Désactivé', value: 'disabled', icon: CircleOff },
              ],
            },
          ]}
        />
        <div className='overflow-hidden rounded-md border'>
          <Table className='min-w-xl' aria-label='Catalogue produits'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className='h-24 text-center'
                  >
                    Aucun produit trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div
          className='flex items-center gap-3 text-sm text-muted-foreground'
          aria-live='polite'
        >
          {table.getFilteredRowModel().rows.length} produit
          {table.getFilteredRowModel().rows.length > 1 ? 's' : ''} ·{' '}
          {table.getFilteredSelectedRowModel().rows.length} sélectionnés
        </div>
        <DataTablePagination table={table} className='mt-auto' />
        <ProductsBulkActions
          table={table}
          canDisable={permissions.disable}
          onDisable={(skus) => {
            void disableProducts(
              data.filter((product) => skus.includes(product.sku))
            )
          }}
        />
      </div>

      <AlertDialog
        open={!!pendingDisable}
        onOpenChange={(open) => {
          if (!open) setPendingDisable(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDisable?.title} ne sera plus disponible pour de nouvelles
              opérations. Son historique et son stock seront conservés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDisable) await disableProducts([pendingDisable])
                setPendingDisable(null)
              }}
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DataTableFrenchProvider>
  )
}
