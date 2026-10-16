import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { administrationApi } from '@/api/administration-api'
import { useSession } from '@/context/session-provider'
import { UserManagement } from './user-management'

vi.mock('@/api/administration-api', () => ({
  administrationApi: {
    allUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
  },
}))
vi.mock('@/context/session-provider', () => ({ useSession: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useSession).mockReturnValue({
    user: {
      id: 1,
      fullName: 'Admin Démo',
      email: 'admin@example.test',
      role: 'ADMINISTRATOR',
    },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
  vi.mocked(administrationApi.allUsers).mockResolvedValue([])
})
function view() {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <UserManagement />
    </QueryClientProvider>
  )
}
it('does not load accounts for a non-administrator', async () => {
  vi.mocked(useSession).mockReturnValue({
    user: {
      id: 2,
      fullName: 'Stock Démo',
      email: 'stock@example.test',
      role: 'STOCK_EMPLOYEE',
    },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
  const screen = await view()
  await expect
    .element(
      screen.getByText(
        'La gestion des utilisateurs est réservée aux administrateurs.'
      )
    )
    .toBeVisible()
  expect(administrationApi.allUsers).not.toHaveBeenCalled()
})
it('shows backend errors without closing the creation form', async () => {
  vi.mocked(administrationApi.createUser).mockRejectedValue(
    new Error('Cet email est déjà utilisé.')
  )
  const screen = await view()
  await screen.getByRole('button', { name: 'Créer un utilisateur' }).click()
  await screen.getByLabelText('Nom complet').fill('Compte Démo')
  await screen
    .getByLabelText('Adresse e-mail', { exact: true })
    .fill('demo@example.test')
  await screen
    .getByLabelText('Mot de passe', { exact: true })
    .fill('SyntheticTest123!')
  await screen.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect
    .element(screen.getByText('Cet email est déjà utilisé.'))
    .toBeVisible()
  await expect.element(screen.getByRole('dialog')).toBeVisible()
  expect(administrationApi.createUser).toHaveBeenCalledWith({
    fullName: 'Compte Démo',
    email: 'demo@example.test',
    password: 'SyntheticTest123!',
    role: 'STOCK_EMPLOYEE',
    active: true,
  })
})

it('uses the catalogue toolbar, multi-select filters and column controls', async () => {
  vi.mocked(administrationApi.allUsers).mockResolvedValue([
    {
      id: 1,
      fullName: 'Compte Alpha',
      email: 'alpha@example.test',
      role: 'MANAGER',
      active: false,
    },
    {
      id: 2,
      fullName: 'Compte Beta',
      email: 'beta@example.test',
      role: 'STOCK_EMPLOYEE',
      active: true,
    },
    {
      id: 3,
      fullName: 'Compte Gamma',
      email: 'gamma@example.test',
      role: 'ADMINISTRATOR',
      active: false,
    },
  ])
  const screen = await view()
  await expect
    .element(screen.getByRole('button', { name: 'Affichage' }))
    .toBeVisible()
  await screen
    .getByRole('button', { name: 'Rôle', exact: true })
    .first()
    .click()
  await screen.getByRole('option', { name: /Gestionnaire/ }).click()
  await screen.getByRole('option', { name: /Administrateur/ }).click()
  await userEvent.keyboard('{Escape}')
  await expect
    .element(screen.getByText('Compte Beta', { exact: true }))
    .not.toBeInTheDocument()
  await expect
    .element(screen.getByText('Compte Alpha', { exact: true }))
    .toBeVisible()
  await expect
    .element(screen.getByText('Compte Gamma', { exact: true }))
    .toBeVisible()
  await screen
    .getByRole('button', { name: 'Réinitialiser', exact: true })
    .click()
  await expect
    .element(screen.getByText('Compte Beta', { exact: true }))
    .toBeVisible()
  await screen.getByRole('button', { name: 'Affichage' }).click()
  await screen.getByRole('menuitemcheckbox', { name: 'Adresse e-mail' }).click()
  await expect
    .element(screen.getByRole('columnheader', { name: 'Adresse e-mail' }))
    .not.toBeInTheDocument()
})
