import type {
  AlertStatus,
  AlertType,
  PageResponse,
  StockAlert,
} from '../types/api'
import { apiRequest, queryString } from './client'

export const alertsApi = {
  list: (
    status?: AlertStatus,
    type?: AlertType,
    page = 0,
    signal?: AbortSignal
  ) =>
    apiRequest<PageResponse<StockAlert>>(
      `/api/alerts${queryString({ status, type, page, size: 20 })}`,
      { signal }
    ),
  refresh: () =>
    apiRequest<{ created: number }>('/api/alerts/refresh', { method: 'POST' }),
  acknowledge: (id: number) =>
    apiRequest<StockAlert>(`/api/alerts/${id}/acknowledge`, { method: 'POST' }),
  resolve: (id: number) =>
    apiRequest<StockAlert>(`/api/alerts/${id}/resolve`, { method: 'POST' }),
}
