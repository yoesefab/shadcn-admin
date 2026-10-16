import { createFileRoute } from '@tanstack/react-router'
import { DashboardWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardWorkspace,
})
