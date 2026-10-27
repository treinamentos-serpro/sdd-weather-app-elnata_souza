import { mapGeocodingPayload, mapWeatherPayload } from '../lib/mapOpenMeteo';
import type { City, WeatherData } from '../types/weather';

export type WeatherServiceErrorKind = 'network' | 'http' | 'timeout' | 'invalid-response';

export const weatherErrorMessages: Record<WeatherServiceErrorKind, string> = {
  network:
    'Não foi possível carregar os dados. Verifique sua conexão com a internet e tente novamente.',
  http: 'Não foi possível carregar os dados. O serviço está indisponível no momento. Tente novamente.',
  timeout:
    'Não foi possível carregar os dados. A consulta excedeu o limite de 10 segundos. Tente novamente.',
  'invalid-response':
    'Não foi possível carregar os dados. O serviço retornou uma resposta inválida. Tente novamente.',
};

export class WeatherServiceError extends Error {
  readonly kind: WeatherServiceErrorKind;
  readonly status?: number;

  constructor(message: string, kind: WeatherServiceErrorKind, status?: number) {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
    this.status = status;
  }
}

const geocodingEndpoint = 'https://geocoding-api.open-meteo.com/v1/search';
const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';
const requestTimeoutMs = 10_000;

async function fetchJsonWithTimeout(url: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, requestTimeoutMs);
  const abortFromCaller = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', abortFromCaller, { once: true });

  if (signal?.aborted) {
    abortFromCaller();
  }

  try {
    controller.signal.throwIfAborted();
    const response = await fetch(url, { signal: controller.signal });
    controller.signal.throwIfAborted();
    if (!response.ok) {
      throw new WeatherServiceError(weatherErrorMessages.http, 'http', response.status);
    }

    const payload: unknown = await response.json();
    controller.signal.throwIfAborted();
    return payload;
  } catch (error) {
    if (signal?.aborted) {
      throw signal.reason ?? error;
    }

    if (timedOut) {
      throw new WeatherServiceError(weatherErrorMessages.timeout, 'timeout');
    }

    if (error instanceof WeatherServiceError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new WeatherServiceError(weatherErrorMessages['invalid-response'], 'invalid-response');
    }

    throw new WeatherServiceError(weatherErrorMessages.network, 'network');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return [];
  }

  const url = `${geocodingEndpoint}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;

  const payload = await fetchJsonWithTimeout(url, signal);

  if (
    typeof payload === 'object' &&
    payload !== null &&
    !Array.isArray(payload) &&
    !('results' in payload)
  ) {
    return [];
  }

  const cities = mapGeocodingPayload(payload);
  if (cities === null) {
    throw new WeatherServiceError(weatherErrorMessages['invalid-response'], 'invalid-response');
  }

  return cities;
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '5',
  });

  const payload = await fetchJsonWithTimeout(`${forecastEndpoint}?${params.toString()}`, signal);

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('current' in payload) ||
    payload.current == null ||
    !('daily' in payload) ||
    payload.daily == null
  ) {
    throw new WeatherServiceError(weatherErrorMessages['invalid-response'], 'invalid-response');
  }

  const weather = mapWeatherPayload(payload);
  if (weather === null) {
    throw new WeatherServiceError(weatherErrorMessages['invalid-response'], 'invalid-response');
  }

  return weather;
}
