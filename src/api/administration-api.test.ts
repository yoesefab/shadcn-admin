import { afterEach, expect, it, vi } from 'vitest'
import { administrationApi } from './administration-api'

afterEach(() => vi.restoreAllMocks())
it('loads every user page before handing the list to the shared table', async () => {
  const first = {
    id: 1,
    fullName: 'Compte Alpha',
    email: 'alpha@example.test',
    role: 'MANAGER' as const,
    active: true,
  }
  const second = {
    ...first,
    id: 2,
    fullName: 'Compte Beta',
    email: 'beta@example.test',
  }
  const page = {
    page: 0,
    size: 100,
    totalElements: 101,
    totalPages: 2,
    first: true,
    last: false,
  }
  const list = vi
    .spyOn(administrationApi, 'users')
    .mockResolvedValueOnce({ ...page, content: [first] })
    .mockResolvedValueOnce({
      ...page,
      page: 1,
      first: false,
      last: true,
      content: [second],
    })
  const signal = new AbortController().signal
  expect(await administrationApi.allUsers(signal)).toEqual([first, second])
  expect(list).toHaveBeenNthCalledWith(2, '', 1, signal, { size: 100 })
})
it('does not present a partial list if a later page fails', async () => {
  vi.spyOn(administrationApi, 'users')
    .mockResolvedValueOnce({
      content: [],
      page: 0,
      size: 100,
      totalElements: 101,
      totalPages: 2,
      first: true,
      last: false,
    })
    .mockRejectedValueOnce(new Error('Chargement impossible.'))
  await expect(administrationApi.allUsers()).rejects.toThrow(
    'Chargement impossible.'
  )
})
