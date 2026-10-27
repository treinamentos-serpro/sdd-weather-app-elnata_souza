export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: number | null;
  name: string;
  admin1: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  weatherCode: number | null;
  relativeHumidityPercent: number | null;
  windSpeedKmh: number | null;
  observedAt: string | null;
}

export interface ForecastDay {
  localDate: string;
  availability: 'available' | 'unavailable';
  weatherCode: number | null;
  minimumTemperatureC: number | null;
  maximumTemperatureC: number | null;
  precipitationProbabilityPercent: number | null;
}

export interface WeatherError {
  kind: 'network' | 'http' | 'timeout' | 'invalid-response';
}

export type SectionResult<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: WeatherError };

export interface WeatherData {
  timezone: string;
  timezoneSource: 'provider' | 'utc-fallback';
  current: SectionResult<CurrentWeather>;
  forecast: SectionResult<ForecastDay[]>;
}

export type WeatherSection = 'current' | 'forecast';

export interface WeatherRequest {
  city: City;
  section?: WeatherSection;
}

export interface CitySearchRequest {
  query: string;
}

export interface OpenMeteoService {
  searchCities(request: CitySearchRequest, signal?: AbortSignal): Promise<City[]>;
  getWeather(request: WeatherRequest, signal?: AbortSignal): Promise<WeatherData>;
}

export type Resource<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: WeatherError };
