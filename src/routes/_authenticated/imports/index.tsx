import { createFileRoute } from '@tanstack/react-router'
import { ImportsWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/imports/')({
  component: ImportsWorkspace,
})
