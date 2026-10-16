import { ForecastingPage } from '@/maarif-legacy/pages/ForecastingPage'
import { ImportHistoryPage } from '@/maarif-legacy/pages/ImportHistoryPage'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

describe('backend-only screens', () => {
  it('does not display demonstration imports when the API has no records', async () => {
    const screen = await render(
      <ImportHistoryPage imports={[]} onDownloadErrors={undefined} />
    )
    await expect
      .element(screen.getByRole('heading', { name: 'Historique des imports' }))
      .toBeVisible()
    await expect
      .element(screen.getByText('ventes_27_aout_2026.csv'))
      .not.toBeInTheDocument()
  })

  it('does not display demonstration forecasts when the API has no records', async () => {
    const screen = await render(<ForecastingPage products={[]} />)
    await expect
      .element(screen.getByText('Aucune prévision disponible.'))
      .toBeVisible()
    await expect.element(screen.getByText('Antigone')).not.toBeInTheDocument()
  })
})
