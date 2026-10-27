import { act, renderHook } from '@testing-library/react';
import { useWeather } from '../../../src/hooks/useWeather';
import { mockCity, mockWeatherData } from '../../../src/mocks/weather';
import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', async () => {
  const actual = await vi.importActual<typeof import('../../../src/services/weatherService')>(
    '../../../src/services/weatherService',
  );
  return {
    ...actual,
    getWeather: vi.fn(),
    searchCities: vi.fn(),
  };
});

const otherCity: City = {
  ...mockCity,
  id: 1,
  name: 'Porto',
  admin1: 'Porto',
  latitude: 41.1496,
  longitude: -8.6109,
};

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useWeather', () => {
  it('starts idle with empty data and actions', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.cities).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.query).toBe('');
    expect(result.current.unit).toBe('celsius');
  });

  it('searches and waits for an explicit city selection', async () => {
    mockedSearchCities.mockResolvedValue([mockCity, otherCity]);
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(mockedSearchCities).toHaveBeenCalledWith('Lisboa', expect.any(AbortSignal));
    expect(mockedGetWeather).not.toHaveBeenCalled();
    expect(result.current.status).toBe('success');
    expect(result.current.query).toBe('Lisboa');
    expect(result.current.cities).toEqual([mockCity, otherCity]);
    expect(result.current.selectedCity).toBeNull();
    expect(result.current.data).toBeNull();

    await act(async () => {
      await result.current.selectCity(otherCity);
    });

    expect(mockedGetWeather).toHaveBeenCalledWith(otherCity, expect.any(AbortSignal));
    expect(result.current.selectedCity).toEqual(otherCity);
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
  });

  it('sets empty when the search has no city results', async () => {
    mockedSearchCities.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lugar inexistente');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(result.current.data).toBeNull();
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('blocks short searches and changes unit without calling the services', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(' a ');
      result.current.setUnit('fahrenheit');
    });

    expect(mockedSearchCities).not.toHaveBeenCalled();
    expect(mockedGetWeather).not.toHaveBeenCalled();
    expect(result.current.unit).toBe('fahrenheit');
    expect(result.current.status).toBe('idle');
  });

  it('stores the service error and retries the last search operation', async () => {
    mockedSearchCities
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.', 'network'))
      .mockResolvedValueOnce([mockCity]);
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Falha de rede.');

    await act(async () => {
      await result.current.retry();
    });

    expect(mockedSearchCities).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
    expect(result.current.cities).toEqual([mockCity]);
    expect(result.current.data).toBeNull();
  });

  it('preserva a unidade escolhida durante o carregamento', async () => {
    let resolveWeather: ((data: typeof mockWeatherData) => void) | undefined;
    mockedGetWeather.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveWeather = resolve;
        }),
    );
    const { result } = renderHook(() => useWeather());

    let selection = Promise.resolve();
    act(() => {
      selection = result.current.selectCity(mockCity);
    });
    expect(result.current.status).toBe('loading');

    act(() => {
      result.current.setUnit('fahrenheit');
    });
    expect(result.current.unit).toBe('fahrenheit');

    if (!resolveWeather) {
      throw new Error('A consulta meteorológica deveria estar pendente.');
    }
    resolveWeather(mockWeatherData);
    await act(async () => {
      await selection;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.unit).toBe('fahrenheit');
    expect(result.current.data).toEqual(mockWeatherData);
    expect(mockedGetWeather).toHaveBeenCalledTimes(1);
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it('preserva a cidade quando o forecast falha e permite retry', async () => {
    mockedGetWeather
      .mockRejectedValueOnce(new WeatherServiceError('Falha no forecast.', 'http', 503))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(mockCity);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.selectedCity).toEqual(mockCity);
    expect(result.current.data).toBeNull();
    expect(result.current.error?.kind).toBe('http');

    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.selectedCity).toEqual(mockCity);
    expect(result.current.data).toEqual(mockWeatherData);
    expect(result.current.error).toBeNull();
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
    expect(mockedGetWeather).toHaveBeenLastCalledWith(mockCity, expect.any(AbortSignal));
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it('preserva forecast quando o retry de current falha', async () => {
    mockedGetWeather
      .mockResolvedValueOnce({
        ...mockWeatherData,
        current: { status: 'error', error: { kind: 'invalid-response' } },
      })
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.', 'network'));
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(mockCity);
    });
    const previousForecast = result.current.data?.forecast;
    expect(previousForecast?.status).toBe('success');

    await act(async () => {
      await result.current.retrySection('current');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data?.forecast).toBe(previousForecast);
    expect(result.current.data?.current).toEqual({
      status: 'error',
      error: { kind: 'network' },
    });
    expect(result.current.retryingSection).toBeNull();
  });

  it('ignores a stale weather response after another city is selected', async () => {
    let resolveFirstWeather: ((data: typeof mockWeatherData) => void) | undefined;
    mockedGetWeather
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirstWeather = resolve;
          }),
      )
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    let pendingSelection: Promise<void> | undefined;
    await act(async () => {
      pendingSelection = result.current.selectCity(mockCity);
      await Promise.resolve();
    });
    expect(result.current.status).toBe('loading');

    await act(async () => {
      await result.current.selectCity(otherCity);
    });
    resolveFirstWeather?.(mockWeatherData);
    await act(async () => {
      await pendingSelection;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.selectedCity).toEqual(otherCity);
  });

  it('retries one weather section while preserving the other successful section', async () => {
    const partialWeather = {
      ...mockWeatherData,
      current: { status: 'error' as const, error: { kind: 'invalid-response' as const } },
    };
    mockedGetWeather.mockResolvedValueOnce(partialWeather).mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(mockCity);
    });
    await act(async () => {
      await result.current.retrySection('current');
    });

    expect(result.current.data?.current).toEqual(mockWeatherData.current);
    expect(result.current.data?.forecast).toEqual(mockWeatherData.forecast);
    expect(result.current.retryingSection).toBeNull();
  });

  it('repete a última tentativa parcial sem substituir a seção que já estava válida', async () => {
    mockedGetWeather
      .mockResolvedValueOnce({
        ...mockWeatherData,
        current: { status: 'error', error: { kind: 'invalid-response' } },
      })
      .mockRejectedValueOnce(new WeatherServiceError('Sem conexão.', 'network'))
      .mockResolvedValueOnce({
        ...mockWeatherData,
        forecast: { status: 'error', error: { kind: 'invalid-response' } },
      });
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.selectCity(mockCity);
    });
    const preservedForecast = result.current.data?.forecast;
    await act(async () => {
      await result.current.retrySection('current');
    });
    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data?.current).toEqual(mockWeatherData.current);
    expect(result.current.data?.forecast).toBe(preservedForecast);
    expect(mockedGetWeather).toHaveBeenCalledTimes(3);
    expect(mockedGetWeather).toHaveBeenLastCalledWith(mockCity, expect.any(AbortSignal));
    expect(mockedSearchCities).not.toHaveBeenCalled();
  });

  it('repete a busca aparada após falha offline sem alterar a unidade', async () => {
    mockedSearchCities
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce([mockCity]);
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      result.current.setUnit('fahrenheit');
      await result.current.search('  Lisboa  ');
    });

    expect(result.current.error).toMatchObject({
      kind: 'network',
      message: expect.stringContaining('Verifique sua conexão'),
    });
    await act(async () => {
      await result.current.retry();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.unit).toBe('fahrenheit');
    expect(mockedSearchCities).toHaveBeenCalledTimes(2);
    expect(mockedSearchCities).toHaveBeenNthCalledWith(1, 'Lisboa', expect.any(AbortSignal));
    expect(mockedSearchCities).toHaveBeenNthCalledWith(2, 'Lisboa', expect.any(AbortSignal));
  });

  it('ignora a falha de uma busca cancelada após iniciar outra operação', async () => {
    let rejectFirst: ((reason: Error) => void) | undefined;
    mockedSearchCities
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectFirst = reject;
          }),
      )
      .mockResolvedValueOnce([otherCity]);
    const { result } = renderHook(() => useWeather());
    let pending = Promise.resolve();
    act(() => {
      pending = result.current.search('Lisboa');
    });
    const firstSignal = mockedSearchCities.mock.calls[0]?.[1];
    await act(async () => {
      await result.current.search('Porto');
    });
    expect(firstSignal?.aborted).toBe(true);
    await act(async () => {
      rejectFirst?.(new TypeError('Failed to fetch'));
      await pending;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.cities).toEqual([otherCity]);
    expect(result.current.error).toBeNull();
  });
});
