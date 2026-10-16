import type { ApiErrorPayload } from '../types/api'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/$/,
  ''
)
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly violations: NonNullable<ApiErrorPayload['violations']>

  constructor(payload: ApiErrorPayload) {
    super(payload.message || messageForStatus(payload.status))
    this.name = 'ApiError'
    this.status = payload.status
    this.code = payload.code
    this.violations = payload.violations ?? []
  }
}

function messageForStatus(status: number) {
  if (status === 401) return 'Votre session a expiré. Reconnectez-vous.'
  if (status === 403) return 'Vous n’avez pas l’autorisation nécessaire.'
  if (status === 404) return 'La ressource demandée est introuvable.'
  if (status === 409)
    return 'Cette opération entre en conflit avec les données actuelles.'
  if (status >= 500)
    return 'Le serveur rencontre un problème. Réessayez plus tard.'
  return 'La requête n’a pas pu aboutir.'
}

let csrf: { headerName: string; token: string } | null = null

async function csrfHeader(signal?: AbortSignal) {
  if (csrf) return csrf
  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
    credentials: 'include',
    signal,
  })
  if (!response.ok) throw await toApiError(response)
  csrf = (await response.json()) as { headerName: string; token: string }
  return csrf
}

async function toApiError(response: Response) {
  let payload: Partial<ApiErrorPayload> = {}
  try {
    payload = (await response.json()) as Partial<ApiErrorPayload>
  } catch {
    /* body may be empty */
  }
  return new ApiError({
    status: response.status,
    code: payload.code ?? `HTTP_${response.status}`,
    message: payload.message ?? messageForStatus(response.status),
    violations: payload.violations ?? [],
  })
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  raw?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = new Headers(options.headers)
  let body: BodyInit | undefined
  if (options.body instanceof FormData) body = options.body
  else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }
  if (MUTATION_METHODS.has(method) && path !== '/api/auth/login') {
    const token = await csrfHeader(options.signal ?? undefined)
    headers.set(token.headerName, token.token)
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    body,
    credentials: 'include',
  })
  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== '/api/auth/me' &&
      path !== '/api/auth/login'
    )
      window.dispatchEvent(new Event('maarif:session-expired'))
    throw await toApiError(response)
  }
  if (options.raw) return response as T
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function resetCsrfToken() {
  csrf = null
}
export function queryString<T extends object>(values: T) {
  const params = new URLSearchParams()
  Object.entries(values as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '')
      params.set(key, String(value))
  })
  const serialized = params.toString()
  return serialized ? `?${serialized}` : ''
}
