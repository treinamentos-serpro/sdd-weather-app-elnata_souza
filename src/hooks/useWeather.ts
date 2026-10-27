import { useEffect, useRef, useState } from 'react';
import {
  getWeather,
  searchCities,
  weatherErrorMessages,
  WeatherServiceError,
} from '../services/weatherService';
import type { City, Unit, WeatherData, WeatherSection } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation =
  | { type: 'search'; name: string }
  | { type: 'selectCity'; city: City }
  | { type: 'retrySection'; city: City; section: WeatherSection };

interface WeatherHookState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: WeatherServiceError | null;
  query: string;
  selectedCity: City | null;
  retryingSection: WeatherSection | null;
  unit: Unit;
}

export interface UseWeatherResult extends WeatherHookState {
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
  retrySection: (section: WeatherSection) => Promise<void>;
  setUnit: (unit: Unit) => void;
}

const initialState: WeatherHookState = {
  status: 'idle',
  data: null,
  cities: [],
  error: null,
  query: '',
  selectedCity: null,
  retryingSection: null,
  unit: 'celsius',
};

function toWeatherServiceError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceError) {
    return error;
  }

  return new WeatherServiceError(weatherErrorMessages.network, 'network');
}

export function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherHookState>(initialState);
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);
  const activeController = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      requestId.current += 1;
      activeController.current?.abort();
    },
    [],
  );

  function startRequest() {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    return { id: ++requestId.current, signal: controller.signal };
  }

  async function search(name: string): Promise<void> {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return;
    }

    lastOperation.current = { type: 'search', name: trimmedName };
    const { id: currentRequestId, signal } = startRequest();

    setState((previous) => ({
      ...previous,
      status: 'loading',
      data: null,
      cities: [],
      error: null,
      query: trimmedName,
      selectedCity: null,
      retryingSection: null,
    }));

    try {
      const cities = await searchCities(trimmedName, signal);
      if (currentRequestId !== requestId.current) {
        return;
      }

      if (cities.length === 0) {
        setState((previous) => ({
          ...previous,
          status: 'empty',
          data: null,
          cities: [],
          error: null,
          selectedCity: null,
          retryingSection: null,
        }));
        return;
      }

      setState((previous) => ({
        ...previous,
        status: 'success',
        data: null,
        cities,
        error: null,
        selectedCity: null,
        retryingSection: null,
      }));
    } catch (error) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setState((previous) => ({
        ...previous,
        status: 'error',
        data: null,
        cities: [],
        error: toWeatherServiceError(error),
        retryingSection: null,
      }));
    }
  }

  async function selectCity(city: City): Promise<void> {
    lastOperation.current = { type: 'selectCity', city };
    const { id: currentRequestId, signal } = startRequest();

    setState((previous) => ({
      ...previous,
      status: 'loading',
      data: null,
      cities: [],
      error: null,
      selectedCity: city,
      retryingSection: null,
    }));

    try {
      const data = await getWeather(city, signal);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setState((previous) => ({ ...previous, status: 'success', data, error: null }));
    } catch (error) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setState((previous) => ({
        ...previous,
        status: 'error',
        data: null,
        error: toWeatherServiceError(error),
        retryingSection: null,
      }));
    }
  }

  async function retrySection(section: WeatherSection): Promise<void> {
    const city = state.selectedCity;
    if (city === null) {
      return;
    }

    await retryWeatherSection(city, section);
  }

  async function retryWeatherSection(city: City, section: WeatherSection): Promise<void> {
    lastOperation.current = { type: 'retrySection', city, section };
    const { id: currentRequestId, signal } = startRequest();
    setState((previous) => ({ ...previous, retryingSection: section }));

    try {
      const updatedWeather = await getWeather(city, signal);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setState((previous) => ({
        ...previous,
        data: previous.data
          ? {
              ...previous.data,
              timezone: updatedWeather.timezone,
              timezoneSource: updatedWeather.timezoneSource,
              [section]: updatedWeather[section],
            }
          : updatedWeather,
        error: null,
        retryingSection: null,
      }));
    } catch (error) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      const serviceError = toWeatherServiceError(error);
      setState((previous) => ({
        ...previous,
        status: previous.data === null ? 'error' : previous.status,
        error: previous.data === null ? serviceError : previous.error,
        data: previous.data
          ? {
              ...previous.data,
              [section]: { status: 'error', error: { kind: serviceError.kind } },
            }
          : null,
        retryingSection: null,
      }));
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (operation === null) {
      return;
    }

    if (operation.type === 'search') {
      await search(operation.name);
      return;
    }

    if (operation.type === 'retrySection') {
      await retryWeatherSection(operation.city, operation.section);
      return;
    }

    await selectCity(operation.city);
  }

  return {
    ...state,
    search,
    selectCity,
    retry,
    retrySection,
    setUnit: (unit) => setState((previous) => ({ ...previous, unit })),
  };
}
