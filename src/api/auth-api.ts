import type { UserProfile } from '../types/api'
import { apiRequest, resetCsrfToken } from './client'

export const authApi = {
  login: (
    credentials: { email: string; password: string },
    signal?: AbortSignal
  ) =>
    apiRequest<UserProfile>('/api/auth/login', {
      method: 'POST',
      body: credentials,
      signal,
    }),
  me: (signal?: AbortSignal) =>
    apiRequest<UserProfile>('/api/auth/me', { signal }),
  updateProfile: (profile: { fullName: string; email: string }) =>
    apiRequest<UserProfile>('/api/auth/me', {
      method: 'PUT',
      body: profile,
    }),
  updatePassword: (passwords: {
    currentPassword: string
    newPassword: string
  }) =>
    apiRequest<void>('/api/auth/me/password', {
      method: 'PUT',
      body: passwords,
    }),
  logout: async () => {
    await apiRequest<void>('/api/auth/logout', { method: 'POST' })
    resetCsrfToken()
  },
}
