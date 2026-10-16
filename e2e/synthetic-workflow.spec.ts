import { expect, test } from 'playwright/test'

const email = process.env.E2E_EMAIL
const password = process.env.E2E_PASSWORD

test('an administrator completes the synthetic stock workflow', async ({
  page,
}) => {
  if (!email || !password) {
    throw new Error('E2E_EMAIL et E2E_PASSWORD doivent être définis.')
  }

  const sku = `LIV-${Math.floor(100000 + Math.random() * 900000)}`
  const title = `Livre de test ${sku}`
  const categoryName = `Catégorie synthétique ${sku}`
  const publisherName = `Éditeur synthétique ${sku}`
  const supplierName = `Fournisseur synthétique ${sku}`
  const authorName = `Auteur synthétique ${sku}`

  await page.goto('/sign-in')
  await page.getByLabel('Adresse e-mail').fill(email)
  await page.getByLabel('Mot de passe').fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).toHaveURL(/\/(?:dashboard)?(?:\?|$)/)

  async function createReference(path: string, data: object) {
    const csrfResponse = await page.request.get('/api/auth/csrf')
    expect(csrfResponse.ok()).toBeTruthy()
    const csrf = (await csrfResponse.json()) as {
      headerName: string
      token: string
    }
    const response = await page.request.post(`/api/catalog/${path}`, {
      headers: { [csrf.headerName]: csrf.token },
      data,
    })
    expect(response.status(), await response.text()).toBe(201)
  }
  await createReference('categories', { name: categoryName, parentId: null })
  await createReference('publishers', { name: publisherName })
  await createReference('authors', { name: authorName })
  await createReference('suppliers', {
    name: supplierName,
    defaultLeadTimeDays: 9,
  })
  for (const [path, name] of [
    ['categories', categoryName],
    ['publishers', publisherName],
    ['authors', authorName],
    ['suppliers', supplierName],
  ]) {
    const response = await page.request.get(`/api/catalog/${path}?size=100`)
    expect(response.ok()).toBeTruthy()
    const body = (await response.json()) as {
      content: Array<{ name: string }>
    }
    expect(body.content.some((item) => item.name === name)).toBeTruthy()
  }

  await page.goto('/products')
  await page.getByRole('button', { name: 'Créer un produit' }).click()
  const productDialog = page.getByRole('dialog', { name: 'Créer un produit' })
  await productDialog.getByLabel('SKU').fill(sku)
  await productDialog.getByLabel('Titre').fill(title)
  await productDialog.getByLabel('Auteurs').fill(authorName)
  for (const [field, option] of [
    ['Éditeur', publisherName],
    ['Catégorie', categoryName],
    ['Langue', 'Français'],
    ['Fournisseur', supplierName],
  ]) {
    await productDialog.getByRole('combobox', { name: field }).click()
    await page.getByRole('option', { name: option }).click()
  }
  await productDialog.getByLabel('Prix de vente (MAD)').fill('80')
  await productDialog.getByLabel('Coût d’achat (MAD)').fill('40')
  await productDialog.getByLabel('Stock minimum').fill('5')
  await expect(productDialog.getByLabel('Délai fournisseur (jours)')).toHaveValue('9')
  await productDialog.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(productDialog).toBeHidden()
  await expect(page.getByText(sku, { exact: true })).toBeVisible()

  await page.goto('/inventory')
  await page.getByRole('button', { name: 'Enregistrer un mouvement' }).click()
  const movementDialog = page.getByRole('dialog', {
    name: 'Enregistrer un mouvement de stock',
  })
  await movementDialog.getByRole('combobox', { name: 'Produit' }).click()
  await page.getByRole('option', { name: `${title} — ${sku}` }).click()
  await movementDialog.getByLabel('Quantité').fill('5')
  await movementDialog.getByLabel('Raison').fill('Réception synthétique E2E')
  await movementDialog.getByRole('button', { name: 'Vérifier le mouvement' }).click()
  await page.getByRole('dialog', { name: 'Confirmer le mouvement' }).getByRole('button', {
    name: 'Confirmer et enregistrer',
  }).click()
  await expect(page.getByRole('status')).toContainText('Mouvement enregistré')
  const stockRow = page
    .getByRole('table', { name: 'État de l’inventaire' })
    .getByRole('row', { name: new RegExp(sku) })
  await expect(stockRow).toContainText('5 ex.')

  const inventoryResponse = await page.request.get('/api/inventory?size=100')
  expect(inventoryResponse.ok()).toBeTruthy()
  const inventory = (await inventoryResponse.json()) as {
    content: Array<{ sku: string; currentStock: number }>
  }
  expect(inventory.content.find((item) => item.sku === sku)?.currentStock).toBe(5)

  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible()

  await page.getByRole('button', { name: email }).click()
  await page.getByRole('menuitem', { name: 'Se déconnecter' }).click()
  await page.getByRole('alertdialog', { name: 'Se déconnecter' }).getByRole(
    'button',
    { name: 'Se déconnecter' }
  ).click()
  await expect(page).toHaveURL(/\/sign-in(?:\?|$)/)
})
