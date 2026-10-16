import { createFileRoute } from '@tanstack/react-router'
import { ProductEditorWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/products/$sku/edit')({
  component: ProductEditorRoute,
})

// eslint-disable-next-line react-refresh/only-export-components
function ProductEditorRoute() {
  const { sku } = Route.useParams()
  return <ProductEditorWorkspace sku={sku} />
}
