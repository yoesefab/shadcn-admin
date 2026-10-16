import type {
  Category,
  PageResponse,
  ProductDetail,
  ProductRequest,
  ProductSummary,
  Reference,
  Supplier,
} from '../types/api'
import { apiRequest, queryString } from './client'

interface ProductFilters {
  query?: string
  active?: boolean
  language?: string
  categoryId?: number
  page?: number
  size?: number
}
export const productsApi = {
  list: (filters: ProductFilters, signal?: AbortSignal) =>
    apiRequest<PageResponse<ProductSummary>>(
      `/api/products${queryString(filters)}`,
      { signal }
    ),
  get: (id: number, signal?: AbortSignal) =>
    apiRequest<ProductDetail>(`/api/products/${id}`, { signal }),
  create: (body: ProductRequest) =>
    apiRequest<ProductDetail>('/api/products', { method: 'POST', body }),
  update: (id: number, body: ProductRequest) =>
    apiRequest<ProductDetail>(`/api/products/${id}`, { method: 'PUT', body }),
  uploadImage: (id: number, file: File) => {
    const body = new FormData()
    body.append('file', file)
    return apiRequest<ProductDetail>(`/api/products/${id}/image`, {
      method: 'PUT',
      body,
    })
  },
  removeImage: (id: number) =>
    apiRequest<ProductDetail>(`/api/products/${id}/image`, {
      method: 'DELETE',
    }),
  deactivate: (id: number) =>
    apiRequest<void>(`/api/products/${id}`, { method: 'DELETE' }),
  categories: (page = 0, signal?: AbortSignal) =>
    apiRequest<PageResponse<Category>>(
      `/api/catalog/categories${queryString({ page, size: 100 })}`,
      { signal }
    ),
  authors: (page = 0, signal?: AbortSignal) =>
    apiRequest<PageResponse<Reference>>(
      `/api/catalog/authors${queryString({ page, size: 100 })}`,
      { signal }
    ),
  publishers: (page = 0, signal?: AbortSignal) =>
    apiRequest<PageResponse<Reference>>(
      `/api/catalog/publishers${queryString({ page, size: 100 })}`,
      { signal }
    ),
  suppliers: (page = 0, signal?: AbortSignal) =>
    apiRequest<PageResponse<Supplier>>(
      `/api/catalog/suppliers${queryString({ page, size: 100 })}`,
      { signal }
    ),
}
