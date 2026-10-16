import { useQuery } from '@tanstack/react-query'
import { alertsApi } from '@/api/alerts-api'

export function useOpenAlertCount() {
  return useQuery({
    queryKey: ['alerts', 'open-count'],
    queryFn: async ({ signal }) =>
      (await alertsApi.list('OPEN', undefined, 0, signal)).totalElements,
  })
}
