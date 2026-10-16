import { createFileRoute } from '@tanstack/react-router'
import { ImportHistoryWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/imports/history')({
  component: ImportHistoryWorkspace,
})
