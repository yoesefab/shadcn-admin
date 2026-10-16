import { createFileRoute } from '@tanstack/react-router'
import { InventoryWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/inventory')({
  component: InventoryWorkspace,
})
