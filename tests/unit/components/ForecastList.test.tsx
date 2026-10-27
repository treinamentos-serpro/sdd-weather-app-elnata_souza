import { render, screen } from '@testing-library/react';
import ForecastList from '../../../src/components/ForecastList';
import { mockWeatherData } from '../../../src/mocks/weather';

const forecastDays =
  mockWeatherData.forecast.status === 'success' ? mockWeatherData.forecast.data : [];

describe('ForecastList', () => {
  it('renders five days with localized labels, converted temperatures, and precipitation chances', () => {
    render(<ForecastList days={forecastDays} unit="fahrenheit" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('terça-feira, 27 de outubro')).toBeInTheDocument();
    expect(screen.getByText('68,7 °F')).toBeInTheDocument();
    expect(screen.getByText('59,2 °F')).toBeInTheDocument();
    expect(screen.getAllByText('10%')).toHaveLength(2);
    expect(screen.getAllByText('Probabilidade de chuva')).toHaveLength(5);
  });

  it('shows a status when there are no forecast days', () => {
    render(<ForecastList days={[]} unit="celsius" />);

    expect(screen.getByRole('status')).toHaveTextContent('Previsão indisponível');
  });

  it('keeps unavailable dates in their expected position', () => {
    const daysWithGap = forecastDays.map((day, index) =>
      index === 1
        ? {
            ...day,
            availability: 'unavailable' as const,
            weatherCode: null,
            minimumTemperatureC: null,
            maximumTemperatureC: null,
            precipitationProbabilityPercent: null,
          }
        : day,
    );
    render(<ForecastList days={daysWithGap} unit="celsius" />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(items[1]).toHaveTextContent('quarta-feira, 28 de outubro');
    expect(items[1]).toHaveTextContent('Não disponível');
    expect(items[2]).toHaveTextContent('quinta-feira, 29 de outubro');
  });
});
