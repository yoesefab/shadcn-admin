import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { ProductDetails } from './product-details'

const product = {
  active: true,
  author: 'Ahmed Sefrioui',
  category: 'Roman',
  description: 'Un roman marocain.',
  isbn: '978-0000000000',
  language: 'Français',
  price: 78,
  publisher: 'Librairie des écoles',
  purchaseCost: 49.5,
  sku: 'LIV-000184',
  stock: 42,
  supplier: 'Diffusion Maarif',
  supplierLeadTime: 8,
  threshold: 8,
  title: 'La Boîte à merveilles',
  updatedAtLabel: '27 août 2026 à 18:00',
}

describe('ProductDetails', () => {
  it('presents the product with shadcn actions and disables it after confirmation', async () => {
    const onDisable = vi.fn().mockResolvedValue(undefined)
    const screen = await render(
      <ProductDetails
        onBack={vi.fn()}
        onDisable={onDisable}
        onEdit={vi.fn()}
        product={product}
      />
    )

    await expect.element(screen.getByText(product.title).first()).toBeVisible()
    await expect.element(screen.getByText('Prix de vente')).toBeVisible()
    await screen.getByRole('button', { name: 'Désactiver' }).click()
    await expect
      .element(screen.getByRole('alertdialog'))
      .toHaveAttribute('data-slot', 'alert-dialog-content')
    await screen
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Désactiver' })
      .click()

    expect(onDisable).toHaveBeenCalledWith(product.sku)
    await expect.element(screen.getByText('Produit désactivé')).toBeVisible()
    await expect
      .element(screen.getByText('Désactivé', { exact: true }))
      .toBeVisible()
  })
})
