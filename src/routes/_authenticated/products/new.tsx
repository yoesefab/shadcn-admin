import { createFileRoute } from '@tanstack/react-router'
import { ProductsWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/products/new')({
  component: () => <ProductsWorkspace initialCreate />,
})
