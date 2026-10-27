import { getWeatherPresentation } from '../../src/lib/weatherCodes';

describe('getWeatherPresentation', () => {
  it('retorna a apresentação em português para códigos WMO conhecidos', () => {
    expect(getWeatherPresentation(0)).toEqual({
      icon: '☀️',
      condition: 'Céu limpo',
    });
    expect(getWeatherPresentation(61)).toEqual({
      icon: '🌧️',
      condition: 'Chuva fraca',
    });
  });

  it('usa a apresentação indisponível para códigos desconhecidos ou ausentes', () => {
    const unavailable = { icon: '…', condition: 'Não disponível' };

    expect(getWeatherPresentation(999)).toEqual(unavailable);
    expect(getWeatherPresentation(null)).toEqual(unavailable);
  });
});
