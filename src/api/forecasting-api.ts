import type {
  Forecast,
  PageResponse,
  Recommendation,
  RecommendationStatus,
} from '../types/api'
import { apiRequest, queryString } from './client'

export const forecastingApi = {
  recommendations: (
    status?: RecommendationStatus,
    page = 0,
    signal?: AbortSignal
  ) =>
    apiRequest<PageResponse<Recommendation>>(
      `/api/forecasting/recommendations${queryString({ status, page, size: 20 })}`,
      { signal }
    ),
  generate: (productId: number) =>
    apiRequest<Forecast>(`/api/forecasting/products/${productId}/generate`, {
      method: 'POST',
    }),
  recommend: (productId: number) =>
    apiRequest<Recommendation>(
      `/api/forecasting/products/${productId}/recommend`,
      { method: 'POST' }
    ),
  setStatus: (id: number, status: RecommendationStatus) =>
    apiRequest<Recommendation>(
      `/api/forecasting/recommendations/${id}/status`,
      { method: 'PATCH', body: { status } }
    ),
}
