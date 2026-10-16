import { createFileRoute } from '@tanstack/react-router'
import { LogsWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/logs')({
  component: LogsWorkspace,
})
