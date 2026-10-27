import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ days, unit }: ForecastListProps) {
  if (days.length === 0) {
    return (
      <p role="status" className="text-sm text-slate-300">
        Previsão indisponível
      </p>
    );
  }

  return (
    <ul
      aria-label="Previsão para cinco dias"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
    >
      {days.map((day) => (
        <li key={day.localDate}>
          <ForecastCard day={day} unit={unit} />
        </li>
      ))}
    </ul>
  );
}
