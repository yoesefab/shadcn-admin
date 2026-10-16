import type { UserRole } from '@/types/api'

const ADMINISTRATOR_ONLY_PATHS = ['/administration', '/logs', '/users']
const AUTHENTICATION_PATHS = [
  '/sign-in',
  '/sign-in-2',
  '/sign-up',
  '/forgot-password',
  '/otp',
]

function normalizePath(path: string) {
  try {
    return new URL(path, 'http://localhost').pathname.replace(/\/$/, '') || '/'
  } catch {
    return path.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/'
  }
}

function isStockEmployeePath(path: string) {
  if (['/inventory', '/alerts', '/profile', '/unauthorized'].includes(path))
    return true

  if (path === '/products') return true

  const productSegments = path.split('/').filter(Boolean)
  return (
    productSegments.length === 2 &&
    productSegments[0] === 'products' &&
    productSegments[1] !== 'new'
  )
}

export function canAccessPath(role: UserRole, requestedPath: string) {
  const path = normalizePath(requestedPath)

  if (role === 'ADMINISTRATOR') return true
  if (role === 'STOCK_EMPLOYEE') return isStockEmployeePath(path)

  return !ADMINISTRATOR_ONLY_PATHS.some(
    (adminPath) => path === adminPath || path.startsWith(`${adminPath}/`)
  )
}

export function isAuthenticationPath(requestedPath: string) {
  const path = normalizePath(requestedPath)
  return AUTHENTICATION_PATHS.some(
    (authPath) => path === authPath || path.startsWith(`${authPath}/`)
  )
}

export function getDefaultPath(role: UserRole) {
  return role === 'STOCK_EMPLOYEE' ? '/inventory' : '/'
}
