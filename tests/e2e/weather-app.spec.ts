import { expect, test } from './fixtures';

const cities = [
  {
    id: 2267057,
    name: 'Lisboa',
    latitude: 38.7167,
    longitude: -9.1333,
    admin1: 'Lisboa',
    country: 'Portugal',
  },
  {
    id: 2735943,
    name: 'Porto',
    latitude: 41.1496,
    longitude: -8.6109,
    admin1: 'Porto',
    country: 'Portugal',
  },
];

const forecast = {
  timezone: 'Europe/Lisbon',
  current: {
    time: '2026-10-27T12:00',
    temperature_2m: 20,
    apparent_temperature: 19,
    relative_humidity_2m: 65,
    weather_code: 3,
    wind_speed_10m: 12.5,
  },
  daily: {
    time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
    weather_code: [3, 61, 2, 0, 3],
    temperature_2m_min: [15, 14, 14, 13, 14],
    temperature_2m_max: [20, 19, 21, 22, 20],
    precipitation_probability_max: [10, 70, 20, 0, 10],
  },
};

test('searches, selects the requested coordinates, and switches units without a new request', async ({
  page,
}) => {
  let forecastRequests = 0;
  let selectedCoordinates: URLSearchParams | undefined;

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: { results: cities } });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests += 1;
    selectedCoordinates = new URL(route.request().url()).searchParams;
    await route.fulfill({ json: forecast });
  });

  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await search.fill('Porto');
  await search.press('Enter');

  const cityOption = page.getByRole('button', { name: 'Selecionar Porto, Portugal' });
  await expect(cityOption).toBeVisible();
  expect(forecastRequests).toBe(0);
  await cityOption.click();

  await expect(page.getByRole('heading', { name: 'Clima atual em Porto' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Previsão para cinco dias' })).toBeVisible();
  expect(selectedCoordinates?.get('latitude')).toBe('41.1496');
  expect(selectedCoordinates?.get('longitude')).toBe('-8.6109');
  expect(forecastRequests).toBe(1);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(
    page.getByRole('region', { name: 'Clima atual em Porto' }).getByText('68,0 °F'),
  ).toBeVisible();
  const forecastList = page.getByRole('list', { name: 'Previsão para cinco dias' });
  const cards = forecastList.getByRole('listitem');
  await expect(cards).toHaveCount(5);
  const temperaturesF = [
    ['68,0 °F', '59,0 °F'],
    ['66,2 °F', '57,2 °F'],
    ['69,8 °F', '57,2 °F'],
    ['71,6 °F', '55,4 °F'],
    ['68,0 °F', '57,2 °F'],
  ];
  for (const [index, temperatures] of temperaturesF.entries()) {
    for (const temperature of temperatures) {
      await expect(cards.nth(index).getByText(temperature, { exact: true })).toBeVisible();
    }
  }
  await expect(forecastList.getByText(/°C/)).toHaveCount(0);

  await page.getByRole('button', { name: 'Celsius', exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: 'Clima atual em Porto' })
      .getByText('20,0 °C', { exact: true }),
  ).toBeVisible();
  await expect(forecastList.getByText(/°C/)).toHaveCount(10);
  await expect(forecastList.getByText(/°F/)).toHaveCount(0);
  expect(forecastRequests).toBe(1);
});

test('retries a failed city search without requiring new input', async ({ page }) => {
  let attempts = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 503, body: 'Unavailable' });
      return;
    }

    await route.fulfill({ json: { results: cities } });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Lisboa');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).press('Enter');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('button', { name: 'Selecionar Lisboa, Portugal' })).toBeVisible();
  expect(attempts).toBe(2);
});

for (const operation of ['search', 'forecast'] as const) {
  test(`recupera ${operation} offline repetindo a última operação pelo botão`, async ({ page }) => {
    let offline = true;
    const searchUrls: string[] = [];
    const forecastUrls: string[] = [];
    await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
      searchUrls.push(route.request().url());
      if (operation === 'search' && offline) {
        await route.abort('internetdisconnected');
        return;
      }
      await route.fulfill({ json: { results: cities } });
    });
    await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
      forecastUrls.push(route.request().url());
      if (offline) {
        await route.abort('internetdisconnected');
        return;
      }
      await route.fulfill({ json: forecast });
    });

    await page.goto('/');
    await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Lisboa');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    if (operation === 'forecast') {
      await page.getByRole('button', { name: 'Selecionar Lisboa, Portugal' }).click();
    }

    await expect(page.getByRole('alert')).toContainText('Verifique sua conexão com a internet');
    offline = false;
    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    if (operation === 'search') {
      await expect(page.getByRole('button', { name: 'Selecionar Lisboa, Portugal' })).toBeVisible();
      expect(searchUrls).toHaveLength(2);
      expect(searchUrls[1]).toBe(searchUrls[0]);
      expect(forecastUrls).toHaveLength(0);
    } else {
      await expect(page.getByRole('heading', { name: 'Clima atual em Lisboa' })).toBeVisible();
      expect(searchUrls).toHaveLength(1);
      expect(forecastUrls).toHaveLength(2);
      expect(forecastUrls[1]).toBe(forecastUrls[0]);
    }
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
}

for (const width of [320, 375, 768, 1280]) {
  test.describe(`viewport ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test(`não apresenta rolagem horizontal na largura de ${width}px`, async ({ page }) => {
      await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
        await route.fulfill({ json: { results: cities } });
      });
      await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
        await route.fulfill({ json: forecast });
      });
      await page.goto('/');

      const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
      await search.fill('Lisboa');
      await search.press('Enter');
      await page.getByRole('button', { name: 'Selecionar Lisboa, Portugal' }).click();
      await expect(page.getByRole('heading', { name: 'Clima atual em Lisboa' })).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        )
        .toBe(true);
    });
  });
}
