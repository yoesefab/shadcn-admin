import { CATALOG_PRODUCTS } from '@/maarif-legacy/shared/catalogData'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { ProductCatalog } from './products-catalog'

describe('ProductCatalog', () => {
  it('shows the floating toolbar for selected products and clears it', async () => {
    const screen = await render(
      <ProductCatalog
        products={CATALOG_PRODUCTS}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onView={vi.fn()}
      />
    )
    await expect.element(screen.getByRole('toolbar')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Sélectionner La Boîte à merveilles',
        exact: true,
      })
    )
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Sélectionner Le Pain nu',
        exact: true,
      })
    )
    await expect
      .element(
        screen.getByRole('toolbar', {
          name: 'Actions groupées pour 2 produits sélectionnés',
        })
      )
      .toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Effacer la sélection', exact: true })
    )
    await expect.element(screen.getByRole('toolbar')).not.toBeInTheDocument()
    await expect
      .element(screen.getByText('18 produits · 0 sélectionnés'))
      .toBeVisible()
  })

  it('confirms bulk deactivation and resets the selection', async () => {
    const screen = await render(
      <ProductCatalog
        products={CATALOG_PRODUCTS}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onView={vi.fn()}
      />
    )
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Sélectionner La Boîte à merveilles',
        exact: true,
      })
    )
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Désactiver les produits sélectionnés',
        exact: true,
      })
    )
    await expect.element(screen.getByRole('alertdialog')).toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Annuler', exact: true })
    )
    await expect
      .element(
        screen
          .getByRole('row')
          .filter({ hasText: 'LIV-000184' })
          .getByText('Actif', { exact: true })
      )
      .toBeVisible()
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Désactiver les produits sélectionnés',
        exact: true,
      })
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Désactiver', exact: true })
    )
    await expect
      .element(
        screen
          .getByRole('row')
          .filter({ hasText: 'LIV-000184' })
          .getByText('Désactivé', { exact: true })
      )
      .toBeVisible()
    await expect
      .element(
        screen
          .getByRole('row')
          .filter({ hasText: 'LIV-000231' })
          .getByText('Actif', { exact: true })
      )
      .toBeVisible()
    await expect.element(screen.getByRole('toolbar')).not.toBeInTheDocument()
  })

  it('does not offer bulk deactivation to stock employees', async () => {
    const screen = await render(
      <ProductCatalog
        products={CATALOG_PRODUCTS}
        role='Employé de stock'
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onView={vi.fn()}
      />
    )
    await userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Sélectionner La Boîte à merveilles',
        exact: true,
      })
    )
    await expect.element(screen.getByRole('toolbar')).toBeVisible()
    await expect
      .element(
        screen.getByRole('button', {
          name: 'Exporter les produits sélectionnés',
        })
      )
      .toBeVisible()
    await expect
      .element(
        screen.getByRole('button', {
          name: 'Désactiver les produits sélectionnés',
        })
      )
      .not.toBeInTheDocument()
  })

  it('searches by author and resets to all products', async () => {
    const screen = await render(
      <ProductCatalog
        products={CATALOG_PRODUCTS}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onView={vi.fn()}
      />
    )
    await userEvent.fill(screen.getByRole('textbox'), 'Ahmed Sefrioui')
    await expect
      .element(screen.getByRole('cell', { name: 'LIV-000184', exact: true }))
      .toBeVisible()
    await expect
      .element(screen.getByText('1 produit · 0 sélectionnés'))
      .toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Réinitialiser', exact: true })
    )
    await expect
      .element(screen.getByText('18 produits · 0 sélectionnés'))
      .toBeVisible()
  })

  it('exposes view, edit and create callbacks with the existing data', async () => {
    const onCreate = vi.fn()
    const onView = vi.fn()
    const screen = await render(
      <ProductCatalog
        products={CATALOG_PRODUCTS}
        onCreate={onCreate}
        onEdit={vi.fn()}
        onView={onView}
      />
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Créer un produit' })
    )
    expect(onCreate).toHaveBeenCalledOnce()
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Actions pour La Boîte à merveilles',
        exact: true,
      })
    )
    await expect
      .element(screen.getByRole('menuitem', { name: 'Modifier', exact: true }))
      .toBeVisible()
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Voir', exact: true })
    )
    expect(onView).toHaveBeenCalledWith(
      expect.objectContaining({ sku: 'LIV-000184' })
    )
  })

  it('keeps stock employees read-only', async () => {
    const screen = await render(
      <ProductCatalog
        products={CATALOG_PRODUCTS}
        role='Employé de stock'
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onView={vi.fn()}
      />
    )
    await expect
      .element(screen.getByRole('button', { name: 'Créer un produit' }))
      .not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Actions pour La Boîte à merveilles',
        exact: true,
      })
    )
    await expect
      .element(screen.getByRole('menuitem', { name: 'Voir', exact: true }))
      .toBeVisible()
    await expect
      .element(screen.getByRole('menuitem', { name: 'Modifier', exact: true }))
      .not.toBeInTheDocument()
    await expect
      .element(
        screen.getByRole('menuitem', { name: 'Désactiver', exact: true })
      )
      .not.toBeInTheDocument()
  })
})
