import { createFileRoute } from '@tanstack/react-router'
import { AdministrationWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/administration')({
  component: AdministrationWorkspace,
})
