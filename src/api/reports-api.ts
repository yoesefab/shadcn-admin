import { apiRequest, queryString } from './client'
import type { DashboardFilters } from './dashboard-api'

export const reportsApi = {
  download: (
    path: 'inventory.csv' | 'low-stock.csv' | 'reorder-recommendations.csv',
    signal?: AbortSignal
  ) => apiRequest<Response>(`/api/reports/${path}`, { raw: true, signal }),
  management: (filters: DashboardFilters, signal?: AbortSignal) =>
    apiRequest<Response>(`/api/reports/management.pdf${queryString(filters)}`, {
      raw: true,
      signal,
    }),
}
