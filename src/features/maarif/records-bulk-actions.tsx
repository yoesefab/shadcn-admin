import { useState, type ReactNode } from 'react'
import { type Table } from '@tanstack/react-table'
import { Download } from 'lucide-react'
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

type BulkAction<T> = {
  label: string
  icon: ReactNode
  description: string
  eligible: (row: T) => boolean
  onConfirm: (rows: T[]) => void | boolean | Promise<void | boolean>
}

export type BulkSelection<T> = {
  entityName: string
  entityGender?: 'masculine' | 'feminine'
  exportFileName: string
  actions?: BulkAction<T>[]
}

export function RecordsBulkActions<T>({
  table,
  config,
  rowId,
  rowLabel,
  exportRows,
}: {
  table: Table<T>
  config: BulkSelection<T>
  rowId: (row: T) => string
  rowLabel: (row: T) => string
  exportRows: (rows: T[]) => unknown[][]
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{
    action: BulkAction<T>
    rows: T[]
  } | null>(null)
  const selected = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original)
  const exportSelection = () => {
    const escape = (value: unknown) => {
      const text = String(value ?? '')
      const safe = /^[=+\-@\t\r]/.test(text) ? "'" + text : text
      return '"' + safe.replace(/"/g, '""') + '"'
    }
    const blob = new Blob(
      [
        '\uFEFF' +
          exportRows(selected)
            .map((row) => row.map(escape).join(';'))
            .join('\r\n'),
      ],
      { type: 'text/csv;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = config.exportFileName
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <DataTableBulkActions
        table={table}
        entityName={config.entityName}
        entityGender={config.entityGender}
        locale='fr'
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              aria-label='Exporter la sélection'
              onClick={exportSelection}
            >
              <Download />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exporter la sélection</TooltipContent>
        </Tooltip>
        {config.actions?.map((action) => {
          const eligible = selected.filter(action.eligible)
          return (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label={action.label}
                  disabled={busy || !eligible.length}
                  onClick={() => {
                    setError('')
                    setPending({ action, rows: eligible })
                  }}
                >
                  {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{action.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </DataTableBulkActions>
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setPending(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.action.label} ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className='text-sm'>
            {pending?.rows.length} élément(s) concerné(s) :
          </p>
          <ul className='max-h-40 overflow-y-auto text-sm'>
            {pending?.rows.map((row) => (
              <li key={rowId(row)}>{rowLabel(row)}</li>
            ))}
          </ul>
          {error && (
            <p role='alert' className='text-sm text-destructive'>
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={async (event) => {
                event.preventDefault()
                if (!pending || busy) return
                setBusy(true)
                setError('')
                try {
                  const success = await pending.action.onConfirm(pending.rows)
                  if (success === false) {
                    setError(
                      'Certaines opérations ont été refusées. Vérifiez les lignes et réessayez.'
                    )
                    return
                  }
                  table.resetRowSelection()
                  setPending(null)
                } catch (error) {
                  setError(
                    error instanceof Error
                      ? error.message
                      : 'Opération impossible.'
                  )
                } finally {
                  setBusy(false)
                }
              }}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
