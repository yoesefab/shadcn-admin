import { createFileRoute } from '@tanstack/react-router'
import { ReportsWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/reports')({
  component: ReportsWorkspace,
})
