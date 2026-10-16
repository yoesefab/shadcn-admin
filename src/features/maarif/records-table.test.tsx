import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { RecordsTable } from './records-table'
import { frenchDateOrder } from './table-format'

const data = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  title: `Produit ${index + 1}`,
  status: index % 2 ? 'Inactif' : 'Actif',
}))
const fields = [
  { key: 'title', label: 'Produit' },
  { key: 'status', label: 'Statut', filter: true },
]

describe('RecordsTable', () => {
  it('counts selections across pages, exports filtered selections and clears them', async () => {
    const screen = await render(
      <RecordsTable
        label='Produits'
        data={data}
        fields={fields}
        rowId={(row) => row.id}
        bulkSelection={{
          entityName: 'produit',
          exportFileName: 'selection.csv',
        }}
      />
    )
    await expect.element(screen.getByRole('toolbar')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Sélectionner 1', exact: true })
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Page suivante', exact: true })
    )
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Sélectionner 12', exact: true })
    )
    await expect
      .element(
        screen.getByRole('toolbar', {
          name: 'Actions groupées pour 2 produits sélectionnés',
        })
      )
      .toBeVisible()
    await userEvent.fill(screen.getByRole('textbox'), 'Produit 12')
    await expect
      .element(
        screen.getByRole('toolbar', {
          name: 'Actions groupées pour 1 produit sélectionné',
        })
      )
      .toBeVisible()
    let exported: Blob | undefined
    const createUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation((blob) => {
        exported = blob as Blob
        return 'blob:test'
      })
    const revokeUrl = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {})
    const download = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    try {
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Exporter la sélection',
          exact: true,
        })
      )
      expect(download).toHaveBeenCalledOnce()
      expect(await exported?.text()).toBe(
        '"Produit";"Statut"\r\n"Produit 12";"Inactif"'
      )
    } finally {
      createUrl.mockRestore()
      revokeUrl.mockRestore()
      download.mockRestore()
    }
    await userEvent.click(
      screen.getByRole('button', { name: 'Effacer la sélection', exact: true })
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Réinitialiser', exact: true })
    )
    await expect.element(screen.getByRole('toolbar')).not.toBeInTheDocument()
    await expect
      .element(screen.getByText('12 résultats · 0 sélectionnés'))
      .toBeVisible()
  })

  it('confirms only eligible selected rows and allows cancellation', async () => {
    const onConfirm = vi.fn()
    const screen = await render(
      <RecordsTable
        label='Alertes'
        data={data}
        fields={fields}
        rowId={(row) => row.id}
        bulkSelection={{
          entityName: 'alerte',
          entityGender: 'feminine',
          exportFileName: 'alertes.csv',
          actions: [
            {
              label: 'Résoudre la sélection',
              icon: null,
              description: 'Sans changement de stock.',
              eligible: (row) => row.status === 'Actif',
              onConfirm,
            },
          ],
        }}
      />
    )
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Sélectionner 2', exact: true })
    )
    await expect
      .element(
        screen.getByRole('button', {
          name: 'Résoudre la sélection',
          exact: true,
        })
      )
      .toBeDisabled()
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Sélectionner 1', exact: true })
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Résoudre la sélection', exact: true })
    )
    await expect
      .element(screen.getByRole('alertdialog').getByRole('listitem'))
      .toHaveTextContent('1')
    await userEvent.click(
      screen.getByRole('button', { name: 'Annuler', exact: true })
    )
    expect(onConfirm).not.toHaveBeenCalled()
    await expect
      .element(
        screen.getByRole('toolbar', {
          name: 'Actions groupées pour 2 alertes sélectionnées',
        })
      )
      .toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Résoudre la sélection', exact: true })
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Confirmer', exact: true })
    )
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith([data[0]])
    await expect.element(screen.getByRole('toolbar')).not.toBeInTheDocument()
  })

  it('searches, resets and paginates local records', async () => {
    const screen = await render(
      <RecordsTable
        label='Produits'
        data={data}
        fields={fields}
        rowId={(row) => row.id}
      />
    )
    await userEvent.fill(screen.getByRole('textbox'), 'Produit 12')
    await expect
      .element(screen.getByText('1 résultat · 0 sélectionnés'))
      .toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Réinitialiser', exact: true })
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Page suivante', exact: true })
    )
    await expect
      .element(screen.getByRole('cell', { name: 'Produit 12', exact: true }))
      .toBeVisible()
    await expect.element(screen.getByText('Page 2 sur 2').first()).toBeVisible()
  })

  it('keeps row actions and selection connected to the original record', async () => {
    const onOpen = vi.fn()
    const screen = await render(
      <RecordsTable
        label='Produits'
        data={data}
        fields={fields}
        rowId={(row) => row.id}
        actions={(row) => [{ label: 'Ouvrir', onClick: () => onOpen(row.id) }]}
      />
    )
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Sélectionner 1', exact: true })
    )
    await expect
      .element(screen.getByText('12 résultats · 1 sélectionnés'))
      .toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Actions pour 1', exact: true })
    )
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Ouvrir', exact: true })
    )
    expect(onOpen).toHaveBeenCalledWith('1')
  })

  it('renders read-only details with an unchanged total', async () => {
    const screen = await render(
      <RecordsTable
        label='Détails'
        data={data.slice(0, 2)}
        fields={fields}
        rowId={(row) => row.id}
        selectable={false}
        toolbar={false}
        pagination={false}
        summary={{ label: 'Total', value: '418,00 MAD' }}
      />
    )
    await expect.element(screen.getByRole('checkbox')).not.toBeInTheDocument()
    await expect
      .element(screen.getByRole('cell', { name: '418,00 MAD' }))
      .toBeVisible()
  })
})

describe('frenchDateOrder', () => {
  it('sorts Casablanca fixture dates by year, month, day and time', () => {
    expect(frenchDateOrder('27 août 2026 à 16:42')).toBe(202608271642)
    expect(frenchDateOrder('01 septembre 2026')).toBeGreaterThan(
      frenchDateOrder('31 août 2026 à 23:59')
    )
    expect(frenchDateOrder('inconnue')).toBe(0)
  })
})
