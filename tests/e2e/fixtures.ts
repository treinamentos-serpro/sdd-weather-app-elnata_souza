import { expect, test as base } from '@playwright/test';

export { expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    if (!baseURL) {
      throw new Error('Os testes E2E exigem baseURL.');
    }

    const applicationOrigin = new URL(baseURL).origin;
    const unexpectedRequests: string[] = [];

    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === applicationOrigin) {
        await route.continue();
        return;
      }

      // Evita depender da rede para carregar a fonte; usa o fallback local.
      if (url.origin === 'https://fonts.googleapis.com') {
        await route.fulfill({ contentType: 'text/css', body: '' });
        return;
      }

      unexpectedRequests.push(url.href);
      await route.abort('blockedbyclient');
    });

    await use(page);
    expect(unexpectedRequests, 'Requisições externas sem mock').toEqual([]);
  },
});
