import { mapGeocodingPayload, mapWeatherPayload } from '../../src/lib/mapOpenMeteo';

describe('mapGeocodingPayload', () => {
  it('maps valid city results and uses null for optional metadata', () => {
    expect(
      mapGeocodingPayload({
        results: [
          {
            id: 1,
            name: 'Lisboa',
            latitude: 38.7167,
            longitude: -9.1333,
          },
        ],
      }),
    ).toEqual([
      {
        id: 1,
        name: 'Lisboa',
        admin1: null,
        country: null,
        latitude: 38.7167,
        longitude: -9.1333,
      },
    ]);
  });

  it('distinguishes an empty list from an invalid response', () => {
    expect(mapGeocodingPayload({ results: [] })).toEqual([]);
    expect(mapGeocodingPayload({})).toBeNull();
    expect(mapGeocodingPayload({ results: [{ name: 'Sem coordenadas' }] })).toBeNull();
  });
});

describe('mapWeatherPayload', () => {
  it('keeps five expected date slots when a date is missing from daily data', () => {
    const weather = mapWeatherPayload({
      timezone: 'UTC',
      current: { time: '2026-10-27T12:00' },
      daily: {
        time: ['2026-10-27', '2026-10-29', '2026-10-30', '2026-10-31'],
        weather_code: [1, 3, 0, 2],
        temperature_2m_min: [10, 12, 13, 14],
        temperature_2m_max: [20, 22, 23, 24],
        precipitation_probability_max: [0, 20, 0, 10],
      },
    });

    expect(weather?.forecast.status).toBe('success');
    if (weather?.forecast.status !== 'success') {
      throw new Error('A previsão deveria estar disponível.');
    }

    expect(weather.forecast.data.map(({ localDate }) => localDate)).toEqual([
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ]);
    expect(weather.forecast.data[1]).toMatchObject({
      availability: 'unavailable',
      weatherCode: null,
      minimumTemperatureC: null,
      precipitationProbabilityPercent: null,
    });
  });

  it('distingue precipitação nula de um campo de precipitação ausente', () => {
    const weather = mapWeatherPayload({
      timezone: 'UTC',
      current: { time: '2026-10-27T12:00' },
      daily: {
        time: ['2026-10-27', '2026-10-28'],
        weather_code: [3, 3],
        precipitation_probability_max: [null],
      },
    });

    expect(weather?.forecast.status).toBe('success');
    if (weather?.forecast.status !== 'success') {
      throw new Error('A previsão deveria estar disponível.');
    }

    expect(weather.forecast.data[0]?.precipitationProbabilityPercent).toBe(0);
    expect(weather.forecast.data[1]?.precipitationProbabilityPercent).toBeNull();
  });

  it('isolates invalid current and daily sections', () => {
    const weather = mapWeatherPayload({
      timezone: 'UTC',
      current: null,
      daily: { time: ['2026-10-27'], weather_code: [3] },
    });

    expect(weather?.current).toEqual({ status: 'error', error: { kind: 'invalid-response' } });
    expect(weather?.forecast).toMatchObject({ status: 'success' });
  });

  it('uses UTC when the provider timezone is missing or invalid', () => {
    expect(mapWeatherPayload({ timezone: 'not/a-timezone' })?.timezoneSource).toBe('utc-fallback');
    expect(mapWeatherPayload({})?.timezoneSource).toBe('utc-fallback');
  });

  it('uses UTC today when timezone is missing even if current time is present', () => {
    const weather = mapWeatherPayload(
      {
        current: { time: '2026-10-28T12:00' },
        daily: { time: ['2026-10-28'] },
      },
      new Date('2026-10-27T23:30:00.000Z'),
    );

    expect(weather?.timezoneSource).toBe('utc-fallback');
    expect(weather?.forecast.status).toBe('success');
    if (weather?.forecast.status === 'success') {
      expect(weather.forecast.data[0]?.localDate).toBe('2026-10-27');
    }
  });
});
