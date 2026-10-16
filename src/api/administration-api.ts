import type {
  AuditLog,
  PageResponse,
  Setting,
  UserRequest,
  UserRole,
  UserResponse,
} from '../types/api'
import { apiRequest, queryString } from './client'

export const administrationApi = {
  allUsers: async (signal?: AbortSignal): Promise<UserResponse[]> => {
    const first = await administrationApi.users('', 0, signal, { size: 100 })
    const users = [...first.content]
    for (let page = 1; page < first.totalPages; page++) {
      const next = await administrationApi.users('', page, signal, {
        size: 100,
      })
      users.push(...next.content)
    }
    return users
  },
  users: (
    query = '',
    page = 0,
    signal?: AbortSignal,
    options: {
      role?: UserRole
      active?: boolean
      size?: number
      sortBy?: string
      direction?: string
    } = {}
  ) =>
    apiRequest<PageResponse<UserResponse>>(
      `/api/admin/users${queryString({ query, page, size: 20, ...options })}`,
      { signal }
    ),
  createUser: (body: UserRequest) =>
    apiRequest<UserResponse>('/api/admin/users', { method: 'POST', body }),
  updateUser: (id: number, body: UserRequest) =>
    apiRequest<UserResponse>(`/api/admin/users/${id}`, { method: 'PUT', body }),
  settings: (signal?: AbortSignal) =>
    apiRequest<Setting[]>('/api/admin/settings', { signal }),
  updateSetting: (key: string, value: string, description?: string) =>
    apiRequest<Setting>(`/api/admin/settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: { value, description },
    }),
  audit: (page = 0, signal?: AbortSignal) =>
    apiRequest<PageResponse<AuditLog>>(
      `/api/admin/audit-logs${queryString({ page, size: 20 })}`,
      { signal }
    ),
}
