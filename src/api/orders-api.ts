import type {
  OrderCreateRequest,
  OrderStatus,
  PageResponse,
  SalesOrder,
} from '../types/api'
import { apiRequest, queryString } from './client'

export const ordersApi = {
  list: (status?: OrderStatus, page = 0, signal?: AbortSignal) =>
    apiRequest<PageResponse<SalesOrder>>(
      `/api/orders${queryString({ status, page, size: 20 })}`,
      { signal }
    ),
  get: (id: number, signal?: AbortSignal) =>
    apiRequest<SalesOrder>(`/api/orders/${id}`, { signal }),
  create: (body: OrderCreateRequest) =>
    apiRequest<SalesOrder>('/api/orders', { method: 'POST', body }),
  setStatus: (id: number, status: OrderStatus) =>
    apiRequest<SalesOrder>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),
}
