import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { DateRangePicker } from './date-range-picker'

describe('DateRangePicker', () => {
  it('opens a French calendar with segmented date inputs', async () => {
    const screen = await render(
      <DateRangePicker
        initialDateFrom={new Date(2026, 7, 1)}
        initialDateTo={new Date(2026, 7, 27)}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Choisir une période' })
    )
    await expect.element(screen.getByRole('dialog')).toBeVisible()
    await expect
      .element(screen.getByRole('textbox', { name: 'Jour' }).nth(0))
      .toHaveValue('1')
    await expect
      .element(screen.getByRole('textbox', { name: 'Jour' }).nth(1))
      .toHaveValue('27')
    await expect
      .element(screen.getByRole('button', { name: 'Mettre à jour' }))
      .toBeVisible()
  })

  it('discards uncommitted edits when cancelled', async () => {
    const onUpdate = vi.fn()
    const screen = await render(
      <DateRangePicker
        initialDateFrom={new Date(2026, 7, 1)}
        initialDateTo={new Date(2026, 7, 27)}
        onUpdate={onUpdate}
      />
    )
    const trigger = screen.getByRole('button', { name: 'Choisir une période' })
    await userEvent.click(trigger)
    await userEvent.fill(
      screen.getByRole('textbox', { name: 'Jour' }).nth(0),
      '5'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(onUpdate).not.toHaveBeenCalled()

    await userEvent.click(trigger)
    await expect
      .element(screen.getByRole('textbox', { name: 'Jour' }).nth(0))
      .toHaveValue('1')
  })

  it('applies a changed range and retains it on reopening', async () => {
    const onUpdate = vi.fn()
    const screen = await render(
      <DateRangePicker
        initialDateFrom={new Date(2026, 7, 1)}
        initialDateTo={new Date(2026, 7, 27)}
        onUpdate={onUpdate}
      />
    )
    const trigger = screen.getByRole('button', { name: 'Choisir une période' })
    await userEvent.click(trigger)
    await userEvent.fill(
      screen.getByRole('textbox', { name: 'Jour' }).nth(0),
      '5'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }))
    expect(onUpdate).toHaveBeenCalledOnce()
    expect(onUpdate.mock.calls[0][0].from.getDate()).toBe(5)

    await userEvent.click(trigger)
    await expect
      .element(screen.getByRole('textbox', { name: 'Jour' }).nth(0))
      .toHaveValue('5')
  })
})
