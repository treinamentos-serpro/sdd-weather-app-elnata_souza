import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const unavailableValue = 'Não disponível';

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const presentation = getWeatherPresentation(current.weatherCode);
  const locationDetails = [
    city.admin1 && city.admin1 !== city.name ? city.admin1 : null,
    city.country,
  ]
    .filter(Boolean)
    .join(', ');

  const humidity =
    current.relativeHumidityPercent === null
      ? unavailableValue
      : `${current.relativeHumidityPercent}%`;
  const wind =
    current.windSpeedKmh === null
      ? unavailableValue
      : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(current.windSpeedKmh)} km/h`;
  const apparentTemperature = formatTemperature(current.apparentTemperatureC, unit);

  const metrics = [
    { label: 'Umidade', value: humidity },
    { label: 'Vento', value: wind },
  ];
  const observationTime = current.observedAt?.replace('T', ' ');

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          {locationDetails && <p className="mb-1 text-sm text-slate-300">{locationDetails}</p>}
          <h2 id="current-weather-title" className="text-xl font-semibold">
            Clima atual em {city.name}
          </h2>
          {observationTime ? (
            <p className="mt-2 text-sm text-slate-300">
              Observado <time dateTime={current.observedAt ?? undefined}>{observationTime}</time>
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-300">Horário: {unavailableValue}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-4xl">
            {presentation.icon}
          </span>
          <p className="text-right text-sm text-slate-200">{presentation.condition}</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-6xl font-semibold leading-none">
          {formatTemperature(current.temperatureC, unit)}
        </p>
        <p className="mt-3 text-sm text-slate-300">Sensação térmica: {apparentTemperature}</p>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <dt className="text-sm text-slate-300">{label}</dt>
            <dd className="mt-1 text-lg font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
