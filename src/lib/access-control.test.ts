import { describe, expect, it } from 'vitest'
import {
  canAccessPath,
  getDefaultPath,
  isAuthenticationPath,
} from './access-control'

describe('role access control', () => {
  it('gives the administrator full access', () => {
    expect(canAccessPath('ADMINISTRATOR', '/')).toBe(true)
    expect(canAccessPath('ADMINISTRATOR', '/administration')).toBe(true)
    expect(canAccessPath('ADMINISTRATOR', '/users')).toBe(true)
    expect(canAccessPath('ADMINISTRATOR', '/products/new')).toBe(true)
    expect(getDefaultPath('ADMINISTRATOR')).toBe('/')
  })

  it('limits a stock employee to stock operations and read-only products', () => {
    expect(canAccessPath('STOCK_EMPLOYEE', '/inventory')).toBe(true)
    expect(canAccessPath('STOCK_EMPLOYEE', '/alerts')).toBe(true)
    expect(canAccessPath('STOCK_EMPLOYEE', '/products')).toBe(true)
    expect(canAccessPath('STOCK_EMPLOYEE', '/products/LIV-000184')).toBe(true)
    expect(canAccessPath('STOCK_EMPLOYEE', '/profile')).toBe(true)

    expect(canAccessPath('STOCK_EMPLOYEE', '/')).toBe(false)
    expect(canAccessPath('STOCK_EMPLOYEE', '/orders')).toBe(false)
    expect(canAccessPath('STOCK_EMPLOYEE', '/imports')).toBe(false)
    expect(canAccessPath('STOCK_EMPLOYEE', '/forecasting')).toBe(false)
    expect(canAccessPath('STOCK_EMPLOYEE', '/reports')).toBe(false)
    expect(canAccessPath('STOCK_EMPLOYEE', '/administration')).toBe(false)
    expect(canAccessPath('STOCK_EMPLOYEE', '/users')).toBe(false)
    expect(canAccessPath('STOCK_EMPLOYEE', '/products/new')).toBe(false)
    expect(canAccessPath('STOCK_EMPLOYEE', '/products/LIV-000184/edit')).toBe(
      false
    )
    expect(getDefaultPath('STOCK_EMPLOYEE')).toBe('/inventory')
  })

  it('keeps governance pages administrator-only for legacy managers', () => {
    expect(canAccessPath('MANAGER', '/orders')).toBe(true)
    expect(canAccessPath('MANAGER', '/administration')).toBe(false)
    expect(canAccessPath('MANAGER', '/logs')).toBe(false)
    expect(canAccessPath('MANAGER', '/users')).toBe(false)
  })

  it('recognizes authentication routes during logout navigation', () => {
    expect(isAuthenticationPath('/sign-in')).toBe(true)
    expect(isAuthenticationPath('/sign-in?redirect=%2Finventory')).toBe(true)
    expect(isAuthenticationPath('/inventory')).toBe(false)
  })
})
