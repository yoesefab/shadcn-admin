import { DashboardContent } from '@/maarif-legacy/pages/DashboardPage'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('Dashboard content', () => {
  it('keeps indicators and charts without product tables', async () => {
    const screen = await render(<DashboardContent />)
    await expect
      .element(screen.getByText('Panier moyen', { exact: true }))
      .not.toBeInTheDocument()
    await expect.element(screen.getByRole('table')).not.toBeInTheDocument()
    for (const name of [
      'Indicateurs clés',
      'Tendances',
      'Répartition des ventes',
    ]) {
      await expect
        .element(screen.getByRole('region', { name, exact: true }))
        .toBeVisible()
    }
    await expect
      .element(
        screen.getByRole('region', {
          name: 'Performance des produits et stock',
          exact: true,
        })
      )
      .not.toBeInTheDocument()
  })
})
