import { expect, type Page } from '@playwright/test'

export const assertLoggedOutState = async (page: Page, messageSelector: string) => {
  await expect(page.locator(messageSelector)).toBeAttached()
  await expect(page.locator('[data-test="modal-login"]')).toHaveCount(0)
}

export const openLoginModal = async (page: Page, messageSelector: string) => {
  await page.locator(`${messageSelector} button`).click()
  await expect(page.locator('[data-test="modal-login"]')).toBeAttached()
}
