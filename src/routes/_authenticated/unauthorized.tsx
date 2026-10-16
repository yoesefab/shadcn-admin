import { createFileRoute } from '@tanstack/react-router'
import { UnauthorizedWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/unauthorized')({
  component: UnauthorizedWorkspace,
})
