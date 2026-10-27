import type { City, WeatherData } from '../types/weather';

export const mockCity = {
  id: 2267057,
  name: 'Lisboa',
  admin1: 'Lisboa',
  country: 'Portugal',
  latitude: 38.7167,
  longitude: -9.1333,
} satisfies City;

export const mockWeatherData = {
  timezone: 'Europe/Lisbon',
  timezoneSource: 'provider',
  current: {
    status: 'success',
    data: {
      temperatureC: 18.4,
      apparentTemperatureC: 18.0,
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
        minimumTemperatureC: 14.0,
        maximumTemperatureC: 21.0,
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
} satisfies WeatherData;

export const mockWeatherFixture = {
  city: mockCity,
  weather: mockWeatherData,
} satisfies { city: City; weather: WeatherData };
