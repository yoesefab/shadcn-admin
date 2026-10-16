import type { PageResponse } from '@/types/api'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { productsApi } from '@/api/products-api'
import {
  loadProductFormReferences,
  productRequest,
  type ProductFormReferences,
} from './backend-adapters'
import type { ProductForm } from './product-create-dialog'

const page = <T>(content: T[], index = 0, totalPages = 1): PageResponse<T> => ({
  content,
  page: index,
  size: 100,
  totalElements: content.length,
  totalPages,
  first: index === 0,
  last: index === totalPages - 1,
})

const references: ProductFormReferences = {
  categories: [{ id: 1, name: 'Littérature', parent: null }],
  authors: [{ id: 2, name: 'Auteur référencé' }],
  publishers: [{ id: 3, name: 'Éditions Atlas Démo' }],
  suppliers: [
    {
      id: 4,
      name: 'Distribution Maghreb Démo',
      contactName: null,
      email: null,
      phone: null,
      address: null,
      defaultLeadTimeDays: 9,
      active: true,
    },
  ],
}

afterEach(() => vi.restoreAllMocks())

describe('product form references', () => {
  it('loads every page of the backend catalog', async () => {
    vi.spyOn(productsApi, 'categories').mockImplementation(async (index = 0) =>
      index === 0
        ? page([references.categories[0]], 0, 2)
        : page([{ id: 5, name: 'Jeunesse', parent: null }], 1, 2)
    )
    vi.spyOn(productsApi, 'authors').mockResolvedValue(page(references.authors))
    vi.spyOn(productsApi, 'publishers').mockResolvedValue(
      page(references.publishers)
    )
    vi.spyOn(productsApi, 'suppliers').mockResolvedValue(
      page(references.suppliers)
    )

    const loaded = await loadProductFormReferences()
    expect(loaded.categories.map((item) => item.name)).toEqual([
      'Littérature',
      'Jeunesse',
    ])
    expect(productsApi.categories).toHaveBeenCalledWith(1, undefined)
    expect(loaded.publishers).toEqual(references.publishers)
  })

  it('fails closed when a catalog endpoint is unavailable', async () => {
    vi.spyOn(productsApi, 'categories').mockRejectedValue(
      new Error('Catalogue indisponible')
    )
    vi.spyOn(productsApi, 'authors').mockResolvedValue(page(references.authors))
    vi.spyOn(productsApi, 'publishers').mockResolvedValue(
      page(references.publishers)
    )
    vi.spyOn(productsApi, 'suppliers').mockResolvedValue(
      page(references.suppliers)
    )

    await expect(loadProductFormReferences()).rejects.toThrow(
      'Catalogue indisponible'
    )
  })

  it('uses selected backend IDs instead of silently dropping them', () => {
    const values: ProductForm = {
      sku: 'LIV-123456',
      isbn: '',
      title: 'Livre synthétique',
      authors: 'Auteur référencé',
      description: '',
      publisher: 'Éditions Atlas Démo',
      category: 'Littérature',
      language: 'Français',
      sellingPrice: '80',
      purchaseCost: '40',
      minimumStock: '5',
      supplier: 'Distribution Maghreb Démo',
      supplierLeadTime: '9',
      active: true,
    }

    expect(productRequest(values, references)).toMatchObject({
      categoryId: 1,
      publisherId: 3,
      supplierId: 4,
      authorIds: [2],
    })
    expect(() =>
      productRequest({ ...values, category: 'Catégorie absente' }, references)
    ).toThrow('Référentiel du produit indisponible.')
  })
})
