import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailsWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/orders/$reference')({
  component: OrderDetailsRoute,
})

// eslint-disable-next-line react-refresh/only-export-components
function OrderDetailsRoute() {
  const { reference } = Route.useParams()
  return <OrderDetailsWorkspace reference={reference} />
}
