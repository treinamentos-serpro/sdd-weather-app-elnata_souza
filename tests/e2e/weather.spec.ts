import { expect, test } from './fixtures';

const geocodingResponse = {
  results: [
    {
      id: 2267057,
      name: 'Lisboa',
      admin1: 'Lisboa',
      country: 'Portugal',
      latitude: 38.7167,
      longitude: -9.1333,
    },
  ],
};

const forecastResponse = {
  timezone: 'Europe/Lisbon',
  current: {
    time: '2026-10-27T12:00',
    temperature_2m: 0,
    apparent_temperature: -2,
    relative_humidity_2m: 72,
    weather_code: 3,
    wind_speed_10m: 12,
  },
  daily: {
    time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
    weather_code: [3, 61, 2, 0, 3],
    temperature_2m_min: [-2, -1, 0, 1, 2],
    temperature_2m_max: [0, 2, 4, 6, 8],
    precipitation_probability_max: [10, 70, 20, 0, 10],
  },
};

test('busca uma cidade, exibe cinco dias e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  let forecastRequests = 0;

  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });

  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('button', { name: 'Selecionar Lisboa, Portugal' }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual em Lisboa' });
  await expect(currentWeather).toBeVisible();
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();

  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias', exact: true });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  expect(forecastRequests).toBe(1);

  await page.getByRole('button', { name: 'Fahrenheit', exact: true }).click();
  await expect(currentWeather.getByText('32,0 °F', { exact: true })).toBeVisible();
  await expect(
    currentWeather.getByText('Sensação térmica: 28,4 °F', { exact: true }),
  ).toBeVisible();
  const cards = forecast.getByRole('listitem');
  const temperaturesF = [
    ['32,0 °F', '28,4 °F'],
    ['35,6 °F', '30,2 °F'],
    ['39,2 °F', '32,0 °F'],
    ['42,8 °F', '33,8 °F'],
    ['46,4 °F', '35,6 °F'],
  ];
  for (const [index, temperatures] of temperaturesF.entries()) {
    for (const temperature of temperatures) {
      await expect(cards.nth(index).getByText(temperature, { exact: true })).toBeVisible();
    }
  }
  await expect(forecast.getByText(/°C/)).toHaveCount(0);

  await page.getByRole('button', { name: 'Celsius', exact: true }).click();
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();
  const temperaturesC = [
    ['0,0 °C', '-2,0 °C'],
    ['2,0 °C', '-1,0 °C'],
    ['4,0 °C', '0,0 °C'],
    ['6,0 °C', '1,0 °C'],
    ['8,0 °C', '2,0 °C'],
  ];
  for (const [index, temperatures] of temperaturesC.entries()) {
    for (const temperature of temperatures) {
      await expect(cards.nth(index).getByText(temperature, { exact: true })).toBeVisible();
    }
  }
  await expect(forecast.getByText(/°F/)).toHaveCount(0);
  expect(forecastRequests).toBe(1);
});

test('mostra nenhum resultado quando o geocoding não contém results', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: {} });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(
    page.getByRole('heading', { name: 'Nenhuma cidade encontrada', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('list', { name: 'Resultados da busca' })).toHaveCount(0);
  expect(forecastRequests).toBe(0);
});

test('renderiza o clima após a busca no viewport mobile de 375×812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', async (route) => {
    await route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Lisboa');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('button', { name: 'Selecionar Lisboa, Portugal' }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual em Lisboa' });
  await expect(currentWeather).toBeVisible();
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();
  await expect(currentWeather.getByText('Nublado', { exact: true })).toBeVisible();
  await expect(currentWeather.getByText('72%', { exact: true })).toBeVisible();

  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias', exact: true });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
});
