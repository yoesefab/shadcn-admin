import { createFileRoute } from '@tanstack/react-router'
import { AlertsWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/alerts')({
  component: AlertsWorkspace,
})
