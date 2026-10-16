import { createFileRoute } from '@tanstack/react-router'
import { ProductDetailsWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/products/$sku/')({
  component: ProductDetailsRoute,
})

// eslint-disable-next-line react-refresh/only-export-components
function ProductDetailsRoute() {
  const { sku } = Route.useParams()
  return <ProductDetailsWorkspace sku={sku} />
}
