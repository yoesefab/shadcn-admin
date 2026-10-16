import { randomBytes, randomUUID } from 'node:crypto'
import { expect, test } from 'playwright/test'

const adminEmail = process.env.E2E_EMAIL
const adminPassword = process.env.E2E_PASSWORD

test('each role sees only its permitted pages and API data', async ({
  browser,
  page,
}) => {
  if (!adminEmail || !adminPassword) {
    throw new Error('E2E_EMAIL et E2E_PASSWORD doivent être définis.')
  }

  await page.goto('/sign-in')
  await page.getByLabel('Adresse e-mail').fill(adminEmail)
  await page.getByLabel('Mot de passe').fill(adminPassword)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('link', { name: 'Utilisateurs' })).toBeVisible()

  const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
  const password = `Aa1-${randomBytes(16).toString('hex')}`

  async function createUser(role: 'MANAGER' | 'STOCK_EMPLOYEE') {
    const csrfResponse = await page.request.get('/api/auth/csrf')
    expect(csrfResponse.ok()).toBeTruthy()
    const csrf = (await csrfResponse.json()) as {
      headerName: string
      token: string
    }
    const email = `e2e-${role.toLowerCase()}-${suffix}@example.test`
    const response = await page.request.post('/api/admin/users', {
      headers: { [csrf.headerName]: csrf.token },
      data: {
        fullName: `Compte synthétique ${role}`,
        email,
        password,
        role,
        active: true,
      },
    })
    expect(response.status()).toBe(201)
    return email
  }

  const stockEmail = await createUser('STOCK_EMPLOYEE')
  const managerEmail = await createUser('MANAGER')
  const baseURL = new URL(page.url()).origin

  const stockContext = await browser.newContext({ baseURL })
  try {
    const stockPage = await stockContext.newPage()
    await stockPage.goto('/sign-in')
    await stockPage.getByLabel('Adresse e-mail').fill(stockEmail)
    await stockPage.getByLabel('Mot de passe').fill(password)
    await stockPage.getByRole('button', { name: 'Se connecter' }).click()
    await expect(stockPage).toHaveURL(/\/inventory(?:\?|$)/)
    await expect(
      stockPage.getByRole('link', { name: 'Inventaire' })
    ).toBeVisible()
    await expect(
      stockPage.getByRole('link', { name: 'Commandes' })
    ).toHaveCount(0)
    expect((await stockPage.request.get('/api/inventory')).status()).toBe(200)
    expect((await stockPage.request.get('/api/orders')).status()).toBe(403)
    await stockPage.goto('/products')
    await expect(
      stockPage.getByRole('button', { name: 'Créer un produit' })
    ).toHaveCount(0)
    await stockPage.goto('/products/new')
    await expect(stockPage).toHaveURL(/\/unauthorized(?:\?|$)/)
    await stockPage.goto('/orders')
    await expect(stockPage).toHaveURL(/\/unauthorized(?:\?|$)/)
  } finally {
    await stockContext.close()
  }

  const managerContext = await browser.newContext({ baseURL })
  try {
    const managerPage = await managerContext.newPage()
    await managerPage.goto('/sign-in')
    await managerPage.getByLabel('Adresse e-mail').fill(managerEmail)
    await managerPage.getByLabel('Mot de passe').fill(password)
    await managerPage.getByRole('button', { name: 'Se connecter' }).click()
    await expect(managerPage.getByRole('link', { name: 'Commandes' })).toBeVisible()
    await expect(
      managerPage.getByRole('link', { name: 'Utilisateurs' })
    ).toHaveCount(0)
    expect((await managerPage.request.get('/api/orders')).status()).toBe(200)
    expect((await managerPage.request.get('/api/admin/users')).status()).toBe(403)
    await managerPage.goto('/users')
    await expect(managerPage).toHaveURL(/\/unauthorized(?:\?|$)/)
  } finally {
    await managerContext.close()
  }
})
