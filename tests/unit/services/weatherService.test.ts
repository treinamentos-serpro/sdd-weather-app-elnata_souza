import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

const mockFetch = vi.fn<typeof fetch>();
const testCity: City = {
  id: 2267057,
  name: 'Lisboa',
  admin1: 'Lisboa',
  country: 'Portugal',
  latitude: 38.7167,
  longitude: -9.1333,
};

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe.each([
  ['busca', () => searchCities('Lisboa')],
  ['clima', () => getWeather(testCity)],
])('falhas de transporte: %s', (_label, request) => {
  it('limita também a leitura do corpo a dez segundos desde o início da requisição', async () => {
    vi.useFakeTimers();
    mockFetch.mockImplementationOnce(
      (_input, init) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              new Response(
                new ReadableStream({
                  start(controller) {
                    init?.signal?.addEventListener(
                      'abort',
                      () => controller.error(new DOMException('Aborted', 'AbortError')),
                      { once: true },
                    );
                  },
                }),
              ),
            );
          }, 2_000);
        }),
    );

    const pending = request();
    const assertion = expect(pending).rejects.toMatchObject({
      kind: 'timeout',
      message: expect.stringContaining('10 segundos'),
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(mockFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(mockFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('orienta a verificar a conexão quando a rede está offline', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(request()).rejects.toMatchObject({
      kind: 'network',
      message: expect.stringContaining('Verifique sua conexão com a internet'),
    });
  });

  it('não confunde interrupção de rede durante o corpo com JSON inválido', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new TypeError('Connection lost'));
          },
        }),
      ),
    );

    await expect(request()).rejects.toMatchObject({ kind: 'network' });
  });

  it('mantém o status HTTP para diagnóstico e mostra mensagem amigável', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 503 }));

    await expect(request()).rejects.toMatchObject({
      kind: 'http',
      status: 503,
      message: expect.stringContaining('O serviço está indisponível'),
    });
  });
});

describe('searchCities', () => {
  it.each([
    '',
    '  \t ',
  ])('retorna lista vazia sem chamar fetch para input vazio %j', async (input) => {
    await expect(searchCities(input)).resolves.toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('encodes the trimmed name and maps geocoding results to City', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 2267057,
              name: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
              admin1: 'São Paulo',
              country: 'Brasil',
            },
            {
              name: 'Cidade sem metadados',
              latitude: -20,
              longitude: -40,
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(searchCities('  São Paulo  ')).resolves.toEqual([
      {
        id: 2267057,
        name: 'São Paulo',
        admin1: 'São Paulo',
        country: 'Brasil',
        latitude: -23.55,
        longitude: -46.63,
      },
      {
        id: null,
        name: 'Cidade sem metadados',
        admin1: null,
        country: null,
        latitude: -20,
        longitude: -40,
      },
    ]);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo&count=10&language=pt&format=json',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('returns an empty array when the response omits results', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(searchCities('Lisboa')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError with the HTTP status for a non-ok response', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 503 }));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      constructor: WeatherServiceError,
      kind: 'http',
      status: 503,
    });
  });

  it('throws WeatherServiceError when the response shape is invalid', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ results: [{ name: 'Sem coordenadas' }] }), { status: 200 }),
    );

    await expect(searchCities('Lisboa')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('throws WeatherServiceError when the JSON response cannot be parsed', async () => {
    mockFetch.mockResolvedValue(new Response('{invalid json', { status: 200 }));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('converts a network failure to WeatherServiceError and clears the timeout', async () => {
    vi.useFakeTimers();
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));

    await expect(searchCities('Lisboa')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: expect.stringContaining('Verifique sua conexão'),
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('converts AbortError to a timeout error and clears the timeout', async () => {
    vi.useFakeTimers();
    mockFetch.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );

    const pendingRequest = searchCities('Lisboa');
    const timeoutAssertion = expect(pendingRequest).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: expect.stringContaining('10 segundos'),
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await timeoutAssertion;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the timeout after a successful response', async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(searchCities('Lisboa')).resolves.toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserva o cancelamento durante a leitura do corpo e limpa o timer', async () => {
    vi.useFakeTimers();
    const caller = new AbortController();
    mockFetch.mockImplementationOnce(async (_input, init) => {
      return new Response(
        new ReadableStream({
          start(controller) {
            init?.signal?.addEventListener(
              'abort',
              () => controller.error(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          },
        }),
      );
    });
    const pending = searchCities('Lisboa', caller.signal);
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(1);
    caller.abort();

    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('não inicia uma requisição quando o sinal já foi cancelado', async () => {
    vi.useFakeTimers();
    const caller = new AbortController();
    caller.abort();

    await expect(searchCities('Lisboa', caller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('getWeather', () => {
  const city: City = {
    id: 2267057,
    name: 'Lisboa',
    admin1: 'Lisboa',
    country: 'Portugal',
    latitude: 38.7167,
    longitude: -9.1333,
  };

  const current = {
    time: '2026-10-27T12:00',
    temperature_2m: 18.4,
    apparent_temperature: 18,
    relative_humidity_2m: 72,
    weather_code: 3,
    wind_speed_10m: 12.3,
  };

  const daily = {
    time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
    weather_code: [3, 61, 2, 0, 3],
    temperature_2m_min: [15.1, 14.8, 14, 13.7, 14.2],
    temperature_2m_max: [20.4, 19.2, 21, 21.8, 20.1],
    precipitation_probability_max: [10, 70, 20, 0, 10],
  };

  function jsonResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  it('lança erro HTTP em vez de retornar dados vazios', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 503 }));

    const request = getWeather(city);
    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ kind: 'http', status: 503 });
  });

  it('classifica JSON inválido como invalid-response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('{invalid json', { status: 200 }));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('classifica rejeição do fetch como falha de rede e limpa o timer', async () => {
    vi.useFakeTimers();
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('aborta o forecast após dez segundos e limpa o timer', async () => {
    vi.useFakeTimers();
    mockFetch.mockImplementationOnce(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );

    const request = getWeather(city);
    const assertion = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
    });
    await vi.advanceTimersByTimeAsync(9_999);
    expect(mockFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(mockFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserva current quando daily está presente mas inválido', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        timezone: 'Europe/Lisbon',
        current,
        daily: { time: 'não é uma lista' },
      }),
    );

    await expect(getWeather(city)).resolves.toMatchObject({
      current: { status: 'success', data: { temperatureC: 18.4 } },
      forecast: { status: 'error', error: { kind: 'invalid-response' } },
    });
  });

  it('preserva campos válidos quando falta a temperatura atual', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        timezone: 'Europe/Lisbon',
        current: {
          time: '2026-10-27T12:00',
          relative_humidity_2m: 72,
          wind_speed_10m: 12.3,
        },
        daily,
      }),
    );

    await expect(getWeather(city)).resolves.toMatchObject({
      current: {
        status: 'success',
        data: {
          temperatureC: null,
          apparentTemperatureC: null,
          relativeHumidityPercent: 72,
          windSpeedKmh: 12.3,
        },
      },
      forecast: { status: 'success' },
    });
  });

  it('maps current and the five parallel daily entries to WeatherData', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ timezone: 'Europe/Lisbon', current, daily }));

    await expect(getWeather(city)).resolves.toEqual({
      timezone: 'Europe/Lisbon',
      timezoneSource: 'provider',
      current: {
        status: 'success',
        data: {
          temperatureC: 18.4,
          apparentTemperatureC: 18,
          weatherCode: 3,
          relativeHumidityPercent: 72,
          windSpeedKmh: 12.3,
          observedAt: '2026-10-27T12:00',
        },
      },
      forecast: {
        status: 'success',
        data: [
          {
            localDate: '2026-10-27',
            availability: 'available',
            weatherCode: 3,
            minimumTemperatureC: 15.1,
            maximumTemperatureC: 20.4,
            precipitationProbabilityPercent: 10,
          },
          {
            localDate: '2026-10-28',
            availability: 'available',
            weatherCode: 61,
            minimumTemperatureC: 14.8,
            maximumTemperatureC: 19.2,
            precipitationProbabilityPercent: 70,
          },
          {
            localDate: '2026-10-29',
            availability: 'available',
            weatherCode: 2,
            minimumTemperatureC: 14,
            maximumTemperatureC: 21,
            precipitationProbabilityPercent: 20,
          },
          {
            localDate: '2026-10-30',
            availability: 'available',
            weatherCode: 0,
            minimumTemperatureC: 13.7,
            maximumTemperatureC: 21.8,
            precipitationProbabilityPercent: 0,
          },
          {
            localDate: '2026-10-31',
            availability: 'available',
            weatherCode: 3,
            minimumTemperatureC: 14.2,
            maximumTemperatureC: 20.1,
            precipitationProbabilityPercent: 10,
          },
        ],
      },
    });

    const requestUrl = new URL(String(mockFetch.mock.calls[0]?.[0]));
    expect(requestUrl.origin + requestUrl.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(requestUrl.searchParams.get('latitude')).toBe('38.7167');
    expect(requestUrl.searchParams.get('longitude')).toBe('-9.1333');
    expect(requestUrl.searchParams.get('forecast_days')).toBe('5');
    expect(requestUrl.searchParams.get('timezone')).toBe('auto');
    expect(requestUrl.searchParams.get('temperature_unit')).toBe('celsius');
  });

  it.each([
    ['current ausente', { daily }],
    ['daily ausente', { current }],
    ['ambos ausentes', {}],
    ['current nulo', { current: null, daily }],
    ['daily nulo', { current, daily: null }],
  ])('lança WeatherServiceError para %s', async (_label, payload) => {
    mockFetch.mockResolvedValue(jsonResponse(payload));

    const request = getWeather(city);
    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('normaliza precipitação nula para zero e preserva os demais valores', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        timezone: 'Europe/Lisbon',
        current,
        daily: {
          ...daily,
          precipitation_probability_max: [null, 70, 20, 0, 10],
        },
      }),
    );

    await expect(getWeather(city)).resolves.toMatchObject({
      forecast: {
        status: 'success',
        data: [
          { precipitationProbabilityPercent: 0 },
          { precipitationProbabilityPercent: 70 },
          { precipitationProbabilityPercent: 20 },
          { precipitationProbabilityPercent: 0 },
          { precipitationProbabilityPercent: 10 },
        ],
      },
    });
  });

  it('throws WeatherServiceError when the forecast payload is not an object', async () => {
    mockFetch.mockResolvedValue(jsonResponse(null));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('aborts when the caller signal is cancelled without reporting a timeout', async () => {
    const controller = new AbortController();
    mockFetch.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );

    const pendingRequest = searchCities('Lisboa', controller.signal);
    controller.abort();

    await expect(pendingRequest).rejects.toMatchObject({ name: 'AbortError' });
  });
});
