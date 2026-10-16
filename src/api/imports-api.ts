import type { ImportPreview, PageResponse } from '../types/api'
import { apiRequest, queryString } from './client'

export const importsApi = {
  list: (page = 0, signal?: AbortSignal) =>
    apiRequest<PageResponse<ImportPreview>>(
      `/api/imports${queryString({ page, size: 20 })}`,
      { signal }
    ),
  get: (id: number, signal?: AbortSignal) =>
    apiRequest<ImportPreview>(`/api/imports/${id}`, { signal }),
  preview: (file: File) => {
    const body = new FormData()
    body.append('file', file)
    return apiRequest<ImportPreview>('/api/imports/sales/preview', {
      method: 'POST',
      body,
    })
  },
  confirm: (id: number) =>
    apiRequest<ImportPreview>(`/api/imports/${id}/confirm`, { method: 'POST' }),
  errors: (id: number) =>
    apiRequest<Response>(`/api/imports/${id}/errors.csv`, { raw: true }),
}
