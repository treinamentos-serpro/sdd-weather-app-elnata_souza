import { expect, test } from './fixtures';

const responseCity = {
  id: 2267057,
  name: 'Lisboa',
  latitude: 38.7167,
  longitude: -9.1333,
  admin1: 'Lisboa',
  country: 'Portugal',
};

const responseWeather = {
  timezone: 'Europe/Lisbon',
  current: {
    time: '2026-10-27T12:00',
    temperature_2m: 18.4,
    apparent_temperature: 18,
    relative_humidity_2m: 72,
    weather_code: 3,
    wind_speed_10m: 12.3,
  },
  daily: {
    time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
    weather_code: [3, 61, 2, 0, 3],
    temperature_2m_min: [15.1, 14.8, 14, 13.7, 14.2],
    temperature_2m_max: [20.4, 19.2, 21, 21.8, 20.1],
    precipitation_probability_max: [10, 70, 20, 0, 10],
  },
};

test('exibe resultados em até três segundos em pelo menos 95 de 100 buscas', async ({
  page,
  context,
}, testInfo) => {
  test.setTimeout(360_000);

  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 100,
    downloadThroughput: 1_250_000,
    uploadThroughput: 1_250_000,
    connectionType: 'wifi',
  });

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.fulfill({ json: { results: [responseCity] } });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await route.fulfill({ json: responseWeather });
  });

  await page.addInitScript(() => {
    document.addEventListener('submit', () => {
      performance.mark('weather-search-submitted');
    });
  });
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  const durations: number[] = [];

  for (let iteration = 0; iteration < 100; iteration += 1) {
    await search.fill(`Lisboa ${iteration}`);
    await search.press('Enter');
    await page.getByRole('button', { name: 'Selecionar Lisboa, Portugal' }).click();
    await expect(page.getByRole('heading', { name: 'Clima atual em Lisboa' })).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Clima atual em Lisboa' })
        .getByText('18,4 °C', { exact: true }),
    ).toBeVisible();
    const cards = page
      .getByRole('region', { name: 'Previsão de 5 dias', exact: true })
      .getByRole('listitem');
    await expect(cards).toHaveCount(5);
    await expect(cards.getByText(/°C/)).toHaveCount(10);
    durations.push(
      await page.evaluate(() => {
        const start = performance.getEntriesByName('weather-search-submitted').at(-1);
        if (!start) {
          throw new Error('O envio da busca não foi registrado.');
        }
        return performance.now() - start.startTime;
      }),
    );
  }

  const sortedDurations = [...durations].sort((a, b) => a - b);
  const underThreeSeconds = durations.filter((duration) => duration <= 3_000).length;
  await testInfo.attach('performance-results.json', {
    body: JSON.stringify(
      {
        runs: durations.length,
        underThreeSeconds,
        p95Milliseconds: sortedDurations[94],
        latencyMilliseconds: 100,
        downloadMegabitsPerSecond: 10,
        measurement:
          'submit até clima e cinco dias verificados; inclui seleção automatizada e overhead do runner',
      },
      null,
      2,
    ),
    contentType: 'application/json',
  });

  expect(underThreeSeconds).toBeGreaterThanOrEqual(95);
});
