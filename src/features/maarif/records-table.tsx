import { useMemo, useState, type ReactNode, type ComponentType } from 'react'
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
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { RecordsBulkActions, type BulkSelection } from './records-bulk-actions'

type Field<T> = {
  key: string
  label: string
  value?: (row: T) => string | number | boolean
  exportValue?: (row: T) => string | number | boolean
  render?: (row: T) => ReactNode
  filter?: boolean
  filterOptions?: {
    label: string
    value: string
    icon?: ComponentType<{ className?: string }>
  }[]
  hidden?: boolean
  sortable?: boolean
}
type RowAction = {
  label: string
  onClick?: () => void
  href?: string
  download?: string
  disabled?: boolean
  variant?: 'default' | 'destructive'
}
type RecordsTableProps<T> = {
  data: T[]
  fields: Field<T>[]
  label: string
  rowId: (row: T) => string
  rowLabel?: (row: T) => string
  actions?: (row: T) => RowAction[]
  searchPlaceholder?: string
  selectable?: boolean
  bulkSelection?: BulkSelection<T>
  toolbar?: boolean
  searchAccessory?: ReactNode
  pagination?: boolean
  summary?: { label: string; value: ReactNode }
}

export function RecordsTable<T>({
  data,
  fields,
  label,
  rowId,
  rowLabel = rowId,
  actions,
  searchPlaceholder = 'Rechercher…',
  selectable = true,
  bulkSelection,
  toolbar = true,
  searchAccessory,
  pagination = true,
  summary,
}: RecordsTableProps<T>) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () =>
      Object.fromEntries(
        fields
          .filter((field) => field.hidden)
          .map((field) => [field.key, false])
      )
  )
  const columns = useMemo<ColumnDef<T>[]>(() => {
    const result: ColumnDef<T>[] = fields.map((field) => ({
      id: field.key,
      accessorFn: (row) =>
        field.value ? field.value(row) : row[field.key as keyof T],
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={field.label} />
      ),
      cell: ({ row, getValue }) =>
        field.render ? field.render(row.original) : String(getValue() ?? '—'),
      meta: { className: '' },
      enableSorting: field.sortable !== false,
      filterFn: (row, id, values: string[]) =>
        values.includes(String(row.getValue(id))),
    }))
    if (selectable)
      result.unshift({
        id: 'select',
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            className='translate-y-0.5'
            aria-label={`Sélectionner la page — ${label}`}
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className='translate-y-0.5'
            aria-label={`Sélectionner ${rowLabel(row.original)}`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      })
    if (actions)
      result.push({
        id: 'actions',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const items = actions(row.original)
          if (!items.length)
            return <span className='text-muted-foreground'>—</span>
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                >
                  <MoreHorizontal className='size-4' />
                  <span className='sr-only'>
                    Actions pour {rowLabel(row.original)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {items.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    disabled={item.disabled}
                    variant={item.variant}
                    onClick={item.onClick}
                    asChild={!!item.href}
                  >
                    {item.href ? (
                      <a href={item.href} download={item.download}>
                        {item.label}
                      </a>
                    ) : (
                      item.label
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      })
    return result
  }, [fields, selectable, label, rowLabel, actions])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: rowId,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: selectable,
    globalFilterFn: (row, _columnId, value: string) =>
      fields.some((field) =>
        String(
          field.value
            ? field.value(row.original)
            : (row.original[field.key as keyof T] ?? '')
        )
          .toLocaleLowerCase('fr')
          .includes(value.trim().toLocaleLowerCase('fr'))
      ),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
  })
  const count = table.getFilteredRowModel().rows.length

  return (
    <DataTableFrenchProvider
      columnLabels={Object.fromEntries(
        fields.map((field) => [field.key, field.label])
      )}
    >
      <section
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-4',
          selectable &&
            bulkSelection &&
            table.getFilteredSelectedRowModel().rows.length > 0 &&
            'pb-20'
        )}
        aria-label={label}
      >
        {toolbar && (
          <DataTableToolbar
            table={table}
            searchPlaceholder={searchPlaceholder}
            searchAccessory={searchAccessory}
            filters={fields
              .filter((field) => field.filter)
              .map((field) => ({
                columnId: field.key,
                title: field.label,
                options:
                  field.filterOptions ??
                  [
                    ...new Set(
                      data.map((row) =>
                        String(
                          field.value
                            ? field.value(row)
                            : row[field.key as keyof T]
                        )
                      )
                    ),
                  ].map((value) => ({ label: value, value })),
              }))}
          />
        )}
        <div className='overflow-hidden rounded-md border'>
          <Table className='min-w-xl' aria-label={label}>
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id}>
                  {group.headers.map((header) => (
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
                    Aucun résultat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {summary && (
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={Math.max(
                      1,
                      table.getVisibleLeafColumns().length - 1
                    )}
                  >
                    {summary.label}
                  </TableCell>
                  <TableCell>{summary.value}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        {toolbar && (
          <div
            className='flex items-center gap-3 text-sm text-muted-foreground'
            aria-live='polite'
          >
            {count} résultat{count > 1 ? 's' : ''}
            {selectable && (
              <>
                {' '}
                · {table.getFilteredSelectedRowModel().rows.length} sélectionnés
              </>
            )}
            {selectable &&
              !bulkSelection &&
              table.getSelectedRowModel().rows.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => table.resetRowSelection()}
                >
                  Effacer la sélection
                </Button>
              )}
          </div>
        )}
        {pagination && (
          <DataTablePagination table={table} className='mt-auto' />
        )}
        {selectable && bulkSelection && (
          <RecordsBulkActions
            table={table}
            config={bulkSelection}
            rowId={rowId}
            rowLabel={rowLabel}
            exportRows={(rows) => [
              fields.map((field) => field.label),
              ...rows.map((row) =>
                fields.map((field) =>
                  field.exportValue
                    ? field.exportValue(row)
                    : field.value
                      ? field.value(row)
                      : row[field.key as keyof T]
                )
              ),
            ]}
          />
        )}
      </section>
    </DataTableFrenchProvider>
  )
}
