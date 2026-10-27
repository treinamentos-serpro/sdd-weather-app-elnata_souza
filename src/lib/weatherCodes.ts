export interface WeatherPresentation {
  icon: string;
  condition: string;
}

const unavailablePresentation: WeatherPresentation = {
  icon: '…',
  condition: 'Não disponível',
};

const weatherPresentations: Record<number, WeatherPresentation> = {
  0: { icon: '☀️', condition: 'Céu limpo' },
  1: { icon: '🌤️', condition: 'Predominantemente limpo' },
  2: { icon: '⛅', condition: 'Parcialmente nublado' },
  3: { icon: '☁️', condition: 'Nublado' },
  45: { icon: '🌫️', condition: 'Nevoeiro' },
  48: { icon: '🌫️', condition: 'Nevoeiro com geada' },
  51: { icon: '🌦️', condition: 'Garoa fraca' },
  53: { icon: '🌦️', condition: 'Garoa moderada' },
  55: { icon: '🌧️', condition: 'Garoa intensa' },
  56: { icon: '🌧️', condition: 'Garoa congelante fraca' },
  57: { icon: '🌧️', condition: 'Garoa congelante intensa' },
  61: { icon: '🌧️', condition: 'Chuva fraca' },
  63: { icon: '🌧️', condition: 'Chuva moderada' },
  65: { icon: '🌧️', condition: 'Chuva intensa' },
  66: { icon: '🌧️', condition: 'Chuva congelante fraca' },
  67: { icon: '🌧️', condition: 'Chuva congelante intensa' },
  71: { icon: '🌨️', condition: 'Neve fraca' },
  73: { icon: '❄️', condition: 'Neve moderada' },
  75: { icon: '❄️', condition: 'Neve intensa' },
  77: { icon: '🌨️', condition: 'Grãos de neve' },
  80: { icon: '🌦️', condition: 'Pancadas de chuva fracas' },
  81: { icon: '🌧️', condition: 'Pancadas de chuva moderadas' },
  82: { icon: '🌧️', condition: 'Pancadas de chuva violentas' },
  85: { icon: '🌨️', condition: 'Pancadas de neve fracas' },
  86: { icon: '❄️', condition: 'Pancadas de neve intensas' },
  95: { icon: '⛈️', condition: 'Trovoada' },
  96: { icon: '⛈️', condition: 'Trovoada com granizo fraco' },
  99: { icon: '⛈️', condition: 'Trovoada com granizo intenso' },
};

export function getWeatherPresentation(weatherCode: number | null): WeatherPresentation {
  if (weatherCode === null) {
    return unavailablePresentation;
  }

  return weatherPresentations[weatherCode] ?? unavailablePresentation;
}
