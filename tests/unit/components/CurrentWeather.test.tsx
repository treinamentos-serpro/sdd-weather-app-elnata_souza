import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import CurrentWeather from '../../../src/components/CurrentWeather';
import UnitToggle from '../../../src/components/UnitToggle';
import { mockCity, mockWeatherData } from '../../../src/mocks/weather';
import type { Unit } from '../../../src/types/weather';

const current = mockWeatherData.current.status === 'success' ? mockWeatherData.current.data : null;

if (current === null) {
  throw new Error('Current weather fixture must be successful');
}

const freezingCurrent = { ...current, temperatureC: 0, apparentTemperatureC: 0 };

function WeatherUnitHarness() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={mockCity} current={freezingCurrent} unit={unit} />
    </>
  );
}

describe('CurrentWeather', () => {
  it('converte 0 °C em 32 °F ao trocar a unidade sem alterar os dados originais', async () => {
    const user = userEvent.setup();
    render(<WeatherUnitHarness />);

    const region = screen.getByRole('region', { name: 'Clima atual em Lisboa' });
    expect(region).toHaveTextContent('0,0 °C');
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(region).toHaveTextContent('32,0 °F');
    expect(region).toHaveTextContent('Sensação térmica: 32,0 °F');
    expect(region).not.toHaveTextContent('0,0 °C');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(freezingCurrent.temperatureC).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Celsius' }));
    expect(region).toHaveTextContent('0,0 °C');
    expect(region).not.toHaveTextContent('32,0 °F');
  });

  it('shows the city, condition, converted temperature, and metrics', () => {
    render(<CurrentWeather city={mockCity} current={current} unit="fahrenheit" />);

    expect(screen.getByRole('heading', { name: 'Clima atual em Lisboa' })).toBeInTheDocument();
    expect(screen.getByText('Nublado')).toBeInTheDocument();
    expect(screen.getByText('65,1 °F')).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 64,4 °F')).toBeInTheDocument();
    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('Vento')).toBeInTheDocument();
    expect(screen.getByText('12,3 km/h')).toBeInTheDocument();
  });

  it('marks missing humidity and wind values as unavailable', () => {
    render(
      <CurrentWeather
        city={mockCity}
        current={{ ...current, relativeHumidityPercent: null, windSpeedKmh: null }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(screen.getByText('Vento')).toBeInTheDocument();
    expect(screen.getAllByText('Não disponível')).toHaveLength(2);
  });
});
