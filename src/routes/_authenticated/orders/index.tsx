import { createFileRoute } from '@tanstack/react-router'
import { OrdersWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersWorkspace,
})
