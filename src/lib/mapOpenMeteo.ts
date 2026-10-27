import type {
  City,
  CurrentWeather,
  ForecastDay,
  SectionResult,
  WeatherData,
} from '../types/weather';
import { getForecastDates, isValidLocalDate } from './date';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isValidTimezone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function mapCity(value: unknown): City | null {
  if (
    !isRecord(value) ||
    typeof value.name !== 'string' ||
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude)
  ) {
    return null;
  }

  return {
    id: typeof value.id === 'number' && Number.isFinite(value.id) ? value.id : null,
    name: value.name,
    admin1: typeof value.admin1 === 'string' ? value.admin1 : null,
    country: typeof value.country === 'string' ? value.country : null,
    latitude: value.latitude,
    longitude: value.longitude,
  };
}

export function mapGeocodingPayload(payload: unknown): City[] | null {
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    return null;
  }

  const cities = payload.results.map(mapCity);
  return cities.every((city) => city !== null) ? cities : null;
}

function errorResult<T>(): SectionResult<T> {
  return { status: 'error', error: { kind: 'invalid-response' } };
}

function mapCurrentWeather(value: unknown): SectionResult<CurrentWeather> {
  if (!isRecord(value)) {
    return errorResult();
  }

  return {
    status: 'success',
    data: {
      temperatureC: numberOrNull(value.temperature_2m),
      apparentTemperatureC: numberOrNull(value.apparent_temperature),
      weatherCode: numberOrNull(value.weather_code),
      relativeHumidityPercent: numberOrNull(value.relative_humidity_2m),
      windSpeedKmh: numberOrNull(value.wind_speed_10m),
      observedAt: typeof value.time === 'string' ? value.time : null,
    },
  };
}

function mapForecast(value: unknown, dates: string[]): SectionResult<ForecastDay[]> {
  if (!isRecord(value) || !Array.isArray(value.time) || !value.time.every(isValidLocalDate)) {
    return errorResult();
  }

  const dailyDates = value.time;
  const dailyValues = (key: string): unknown[] => (Array.isArray(value[key]) ? value[key] : []);
  const weatherCodes = dailyValues('weather_code');
  const minimumTemperatures = dailyValues('temperature_2m_min');
  const maximumTemperatures = dailyValues('temperature_2m_max');
  const precipitationProbabilities = dailyValues('precipitation_probability_max');

  return {
    status: 'success',
    data: dates.map((localDate) => {
      const index = dailyDates.indexOf(localDate);
      const weatherCode = numberOrNull(weatherCodes[index]);
      const minimumTemperatureC = numberOrNull(minimumTemperatures[index]);
      const maximumTemperatureC = numberOrNull(maximumTemperatures[index]);
      const precipitationProbabilityPercent =
        precipitationProbabilities[index] === null
          ? 0
          : numberOrNull(precipitationProbabilities[index]);

      return {
        localDate,
        availability:
          weatherCode === null &&
          minimumTemperatureC === null &&
          maximumTemperatureC === null &&
          precipitationProbabilityPercent === null
            ? 'unavailable'
            : 'available',
        weatherCode,
        minimumTemperatureC,
        maximumTemperatureC,
        precipitationProbabilityPercent,
      };
    }),
  };
}

export function mapWeatherPayload(payload: unknown, now: Date = new Date()): WeatherData | null {
  if (!isRecord(payload)) {
    return null;
  }

  const providerTimezone = typeof payload.timezone === 'string' ? payload.timezone : null;
  const hasProviderTimezone = providerTimezone !== null && isValidTimezone(providerTimezone);
  const timezone = hasProviderTimezone && providerTimezone !== null ? providerTimezone : 'UTC';
  const current = mapCurrentWeather(payload.current);
  const currentTime = current.status === 'success' ? current.data.observedAt : null;
  const dates = getForecastDates(timezone, hasProviderTimezone ? currentTime : null, now);

  return {
    timezone,
    timezoneSource: hasProviderTimezone ? 'provider' : 'utc-fallback',
    current,
    forecast: mapForecast(payload.daily, dates),
  };
}
