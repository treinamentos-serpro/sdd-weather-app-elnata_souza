import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import type { UseWeatherResult } from '../../src/hooks/useWeather';
import { useWeather } from '../../src/hooks/useWeather';
import { mockCity, mockWeatherData } from '../../src/mocks/weather';
import { WeatherServiceError } from '../../src/services/weatherService';
import type { City, Unit, WeatherSection } from '../../src/types/weather';

vi.mock('../../src/hooks/useWeather', () => ({
  useWeather: vi.fn(),
}));

const mockedUseWeather = vi.mocked(useWeather);
const search = vi.fn<(name: string) => Promise<void>>().mockResolvedValue(undefined);
const selectCity = vi.fn<(city: City) => Promise<void>>().mockResolvedValue(undefined);
const retry = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
const retrySection = vi
  .fn<(section: WeatherSection) => Promise<void>>()
  .mockResolvedValue(undefined);
const setUnit = vi.fn<(unit: Unit) => void>();

function createHookState(overrides: Partial<UseWeatherResult> = {}): UseWeatherResult {
  return {
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
    selectedCity: null,
    search,
    selectCity,
    retry,
    retrySection,
    retryingSection: null,
    unit: 'celsius',
    setUnit,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseWeather.mockReturnValue(createHookState());
});

describe('App weather hook integration', () => {
  it('starts idle and sends submitted searches to useWeather', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Pesquise uma cidade' })).toBeInTheDocument();
    const searchbox = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    await user.type(searchbox, 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(search).toHaveBeenCalledWith('Lisboa');
  });

  it('shows matching cities and selects a city only after an explicit action', async () => {
    const user = userEvent.setup();
    mockedUseWeather.mockReturnValue(
      createHookState({ status: 'success', query: 'Lisboa', cities: [mockCity] }),
    );
    render(<App />);

    expect(screen.getByRole('button', { name: /Selecionar Lisboa/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Selecionar Lisboa/ }));

    expect(selectCity).toHaveBeenCalledWith(mockCity);
    expect(search).not.toHaveBeenCalled();
  });

  it('renders loading, empty, error, and success states from the hook', async () => {
    const user = userEvent.setup();
    mockedUseWeather.mockReturnValue(createHookState({ status: 'loading', query: 'Porto' }));
    const { rerender } = render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');

    mockedUseWeather.mockReturnValue(createHookState({ status: 'empty', query: 'Porto' }));
    rerender(<App />);
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();

    mockedUseWeather.mockReturnValue(
      createHookState({
        status: 'error',
        query: 'Porto',
        error: new WeatherServiceError('Falha de rede.', 'network'),
      }),
    );
    rerender(<App />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledOnce();

    mockedUseWeather.mockReturnValue(
      createHookState({
        status: 'success',
        query: 'Porto',
        data: mockWeatherData,
        cities: [mockCity],
        selectedCity: mockCity,
      }),
    );
    rerender(<App />);
    expect(screen.getByRole('heading', { name: 'Clima atual em Lisboa' })).toBeInTheDocument();
  });

  it('keeps unit as UI state and passes it to presentation components', async () => {
    const user = userEvent.setup();
    mockedUseWeather.mockReturnValue(
      createHookState({
        status: 'success',
        query: 'Lisboa',
        data: mockWeatherData,
        cities: [mockCity],
        selectedCity: mockCity,
      }),
    );
    const { rerender } = render(<App />);

    expect(screen.getByText('18,4 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(setUnit).toHaveBeenCalledWith('fahrenheit');
    mockedUseWeather.mockReturnValue(
      createHookState({
        status: 'success',
        query: 'Lisboa',
        data: mockWeatherData,
        cities: [mockCity],
        selectedCity: mockCity,
        unit: 'fahrenheit',
      }),
    );
    rerender(<App />);
    expect(screen.getByText('65,1 °F')).toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
  });

  it('keeps the forecast visible when current conditions fail and retries only current', async () => {
    const user = userEvent.setup();
    mockedUseWeather.mockReturnValue(
      createHookState({
        status: 'success',
        query: 'Lisboa',
        data: {
          ...mockWeatherData,
          current: { status: 'error', error: { kind: 'invalid-response' } },
        },
        cities: [mockCity],
        selectedCity: mockCity,
      }),
    );
    render(<App />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o clima atual.');
    expect(screen.getByRole('list', { name: 'Previsão para cinco dias' })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Tentar novamente' })[0]!);

    expect(retrySection).toHaveBeenCalledWith('current');
  });
});
