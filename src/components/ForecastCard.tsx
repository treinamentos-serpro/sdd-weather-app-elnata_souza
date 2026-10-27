import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherPresentation } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

const unavailableValue = 'Não disponível';

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const isUnavailable = day.availability === 'unavailable';
  const presentation = getWeatherPresentation(isUnavailable ? null : day.weatherCode);
  const maximumTemperature = isUnavailable
    ? unavailableValue
    : formatTemperature(day.maximumTemperatureC, unit);
  const minimumTemperature = isUnavailable
    ? unavailableValue
    : formatTemperature(day.minimumTemperatureC, unit);
  const precipitation =
    isUnavailable || day.precipitationProbabilityPercent === null
      ? unavailableValue
      : `${day.precipitationProbabilityPercent}%`;

  return (
    <article className="h-full rounded-lg border border-white/10 bg-white/5 p-4 text-white backdrop-blur-md">
      <h3 className="text-center text-sm font-semibold capitalize text-slate-100">
        {formatDayLabel(day.localDate)}
      </h3>

      <div className="mt-4 flex min-h-14 flex-col items-center justify-center gap-1 text-center">
        <span aria-hidden="true" className="text-3xl">
          {presentation.icon}
        </span>
        <p className="text-xs text-slate-300">{presentation.condition}</p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div>
          <dt className="text-xs text-slate-400">Máx.</dt>
          <dd className="mt-1 text-sm font-medium">{maximumTemperature}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Mín.</dt>
          <dd className="mt-1 text-sm font-medium">{minimumTemperature}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-white/10 pt-3 text-center">
        <p className="text-xs text-slate-400">Probabilidade de chuva</p>
        <p className="mt-1 text-sm font-medium">{precipitation}</p>
      </div>
    </article>
  );
}
