import type {
  InventoryMovement,
  InventoryMovementType,
  PageResponse,
  StockItem,
} from '../types/api'
import { apiRequest, queryString } from './client'

export const inventoryApi = {
  list: (page = 0, size = 20, signal?: AbortSignal) =>
    apiRequest<PageResponse<StockItem>>(
      `/api/inventory${queryString({ page, size })}`,
      { signal }
    ),
  movements: (productId: number, page = 0, signal?: AbortSignal) =>
    apiRequest<PageResponse<InventoryMovement>>(
      `/api/inventory/products/${productId}/movements${queryString({ page, size: 20 })}`,
      { signal }
    ),
  record: (body: {
    productId: number
    type: InventoryMovementType
    quantity: number
    reason: string
  }) =>
    apiRequest<InventoryMovement>('/api/inventory/movements', {
      method: 'POST',
      body,
    }),
}
