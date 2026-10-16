import { createFileRoute } from '@tanstack/react-router'
import { ForecastingWorkspace } from '@/features/maarif/workspace'

export const Route = createFileRoute('/_authenticated/forecasting')({
  component: ForecastingWorkspace,
})
