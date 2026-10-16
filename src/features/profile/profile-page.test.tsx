import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ProfilePage } from './profile-page'

vi.mock('@/context/session-provider', () => ({
  useSession: () => ({
    user: {
      id: 7,
      fullName: 'Samira Benali',
      email: 'samira@example.test',
      role: 'MANAGER',
    },
  }),
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the authenticated user profile and account forms', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const screen = await render(
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <ProfilePage />
        </SidebarProvider>
      </QueryClientProvider>
    )

    await expect
      .element(screen.getByRole('heading', { name: 'Mon profil', level: 1 }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('heading', { name: 'Samira Benali', level: 2 }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByLabelText('Nom complet'))
      .toHaveValue('Samira Benali')
    await expect
      .element(screen.getByLabelText('Adresse e-mail'))
      .toHaveValue('samira@example.test')
    await expect
      .element(screen.getByLabelText('Mot de passe actuel'))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('button', { name: 'Modifier le mot de passe' }))
      .toBeInTheDocument()
  })
})
