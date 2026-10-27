import {
  convertTemperature,
  formatTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('conversão de temperatura', () => {
  it('converte Celsius para Fahrenheit nos pontos de referência', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('mantém Celsius e converte Fahrenheit conforme a unidade', () => {
    expect(convertTemperature(20, 'celsius')).toBe(20);
    expect(convertTemperature(20, 'fahrenheit')).toBe(68);
  });

  it('formata com uma casa decimal, arredondamento pt-BR e símbolo da unidade', () => {
    expect(formatTemperature(20.06, 'celsius')).toBe('20,1 °C');
    expect(formatTemperature(20, 'fahrenheit')).toBe('68,0 °F');
    expect(formatTemperature(20, 'celsius')).toBe('20,0 °C');
  });

  it('retorna a temperatura indisponível quando o valor é nulo', () => {
    expect(formatTemperature(null, 'fahrenheit')).toBe('Não disponível');
  });

  it('retorna o rótulo correspondente à unidade', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
