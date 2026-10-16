import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Ban, Download } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions } from '@/components/data-table'
import type { Product } from './products-catalog'

export function ProductsBulkActions({
  table,
  canDisable,
  onDisable,
}: {
  table: Table<Product>
  canDisable: boolean
  onDisable: (skus: string[]) => void
}) {
  const [pending, setPending] = useState<Product[]>([])
  const selected = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)
  const active = selected.filter((product) => product.active)
  const exportSelection = () => {
    const escape = (value: string | number) => {
      const text = String(value)
      const safe = /^[=+\-@\t\r]/.test(text) ? "'" + text : text
      return '"' + safe.replace(/"/g, '""') + '"'
    }
    const rows = [
      [
        'SKU',
        'Produit',
        'Auteur',
        'Catégorie',
        'Langue',
        'Prix (MAD)',
        'Stock',
        'Statut',
      ],
      ...selected.map((product) => [
        product.sku,
        product.title,
        product.author,
        product.category,
        product.language,
        product.price,
        product.stock,
        product.active ? 'Actif' : 'Désactivé',
      ]),
    ]
    const blob = new Blob(
      ['\uFEFF' + rows.map((row) => row.map(escape).join(';')).join('\r\n')],
      { type: 'text/csv;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'produits-selection.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <DataTableBulkActions table={table} entityName='produit' locale='fr'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={exportSelection}
              aria-label='Exporter les produits sélectionnés'
            >
              <Download />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exporter les produits sélectionnés</TooltipContent>
        </Tooltip>
        {canDisable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                className='size-8'
                disabled={!active.length}
                onClick={() => setPending(active)}
                aria-label='Désactiver les produits sélectionnés'
              >
                <Ban />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Désactiver les produits sélectionnés
            </TooltipContent>
          </Tooltip>
        )}
      </DataTableBulkActions>
      <AlertDialog
        open={pending.length > 0}
        onOpenChange={(open) => {
          if (!open) setPending([])
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Désactiver {pending.length} produit{pending.length > 1 ? 's' : ''}{' '}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Les produits sélectionnés ne seront plus disponibles pour de
              nouvelles opérations. Leur historique et leur stock seront
              conservés. Cette modification reste locale au prototype.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className='max-h-40 overflow-y-auto text-sm'>
            {pending.map((product) => (
              <li key={product.sku}>
                {product.sku} — {product.title}
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDisable(pending.map((product) => product.sku))
                table.resetRowSelection()
                setPending([])
              }}
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
