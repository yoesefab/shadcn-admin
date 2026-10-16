import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { ProfileDropdown } from './profile-dropdown'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, ...props }: ComponentProps<'a'> & { to: string }) => (
    <a href={to} {...props} />
  ),
}))

vi.mock('@/context/session-provider', () => ({
  useSession: () => ({
    user: {
      fullName: 'Samira Benali',
      email: 'samira@example.test',
    },
  }),
}))

vi.mock('@/components/sign-out-dialog', () => ({
  SignOutDialog: ({ open }: { open: boolean }) =>
    open ? (
      <div role='dialog' aria-label='Confirmation de déconnexion' />
    ) : null,
}))

describe('ProfileDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('only offers the profile link and sign-out action', async () => {
    const screen = await render(<ProfileDropdown />)

    await userEvent.click(screen.getByRole('button'))

    const profileLink = screen.getByRole('menuitem', { name: /Mon profil/i })
    await expect.element(profileLink).toHaveAttribute('href', '/profile')
    await expect
      .element(screen.getByRole('menuitem', { name: /Se déconnecter/i }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('menuitem', { name: /Paramètres/i }))
      .not.toBeInTheDocument()
  })

  it('opens the sign-out confirmation', async () => {
    const screen = await render(<ProfileDropdown />)

    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(
      screen.getByRole('menuitem', { name: /Se déconnecter/i })
    )

    await expect
      .element(screen.getByRole('dialog', { name: /déconnexion/i }))
      .toBeInTheDocument()
  })
})
