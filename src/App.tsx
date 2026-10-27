import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import { weatherErrorMessages } from './services/weatherService';
import type { City, Unit, WeatherData, WeatherSection } from './types/weather';

interface WeatherContentProps {
  city: City;
  weather: WeatherData;
  unit: Unit;
  onRetry: (section: WeatherSection) => void;
  retryingSection: WeatherSection | null;
}

function WeatherContent({ city, weather, unit, onRetry, retryingSection }: WeatherContentProps) {
  return (
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
      {weather.current.status === 'success' ? (
        <CurrentWeather city={city} current={weather.current.data} unit={unit} />
      ) : (
        <ErrorState
          message={`Não foi possível carregar o clima atual. ${weatherErrorMessages[weather.current.error.kind]}`}
          onRetry={() => onRetry('current')}
          isLoading={retryingSection === 'current'}
        />
      )}

      <section aria-labelledby="forecast-heading" className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="forecast-heading" className="text-lg font-semibold text-white">
            Previsão de 5 dias
          </h2>
          <p className="text-xs text-slate-400">
            Fuso: {weather.timezoneSource === 'utc-fallback' ? 'UTC' : weather.timezone}
          </p>
        </div>
        {weather.forecast.status === 'success' ? (
          <ForecastList days={weather.forecast.data} unit={unit} />
        ) : (
          <ErrorState
            message={`Não foi possível carregar a previsão. ${weatherErrorMessages[weather.forecast.error.kind]}`}
            onRetry={() => onRetry('forecast')}
            isLoading={retryingSection === 'forecast'}
          />
        )}
        <p className="text-xs text-slate-400">
          Dados meteorológicos adaptados de{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            Open-Meteo
          </a>
          {' · '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            CC BY 4.0
          </a>
        </p>
      </section>
    </div>
  );
}

export default function App() {
  const weather = useWeather();
  const [query, setQuery] = useState(weather.query);
  const unit = weather.unit;
  const viewStatus = query.trim() === weather.query.trim() ? weather.status : 'idle';

  function handleSearch(searchQuery: string) {
    void weather.search(searchQuery);
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
  }

  function retrySearch() {
    void weather.retry();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-[#0b1020] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-night-900/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center lg:px-8">
          <a
            href="#main-content"
            className="flex w-fit items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
          >
            <span
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-xl bg-sun/15 text-xl text-sun"
            >
              ☀
            </span>
            <span className="text-lg font-semibold tracking-wide">Tempo</span>
          </a>

          <SearchBar
            query={query}
            onQueryChange={handleQueryChange}
            onSearch={handleSearch}
            onSelectCity={(city) => void weather.selectCity(city)}
            cities={viewStatus === 'success' && !weather.data ? weather.cities : []}
            isLoading={viewStatus === 'loading'}
          />

          <div className="flex md:justify-end">
            <UnitToggle unit={unit} onChange={weather.setUnit} />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {viewStatus === 'idle' && (
          <EmptyState
            title="Pesquise uma cidade"
            hint="Digite pelo menos dois caracteres para consultar o clima."
          />
        )}
        {viewStatus === 'loading' && <LoadingState />}
        {viewStatus === 'empty' && (
          <EmptyState title="Nenhuma cidade encontrada" hint="Confira a busca e tente novamente." />
        )}
        {viewStatus === 'error' && (
          <ErrorState
            message={weather.error?.message ?? 'Não foi possível carregar os dados.'}
            onRetry={retrySearch}
          />
        )}
        {viewStatus === 'success' && weather.data && weather.selectedCity && (
          <WeatherContent
            city={weather.selectedCity}
            weather={weather.data}
            unit={unit}
            onRetry={(section) => void weather.retrySection(section)}
            retryingSection={weather.retryingSection}
          />
        )}
        {viewStatus === 'success' && !weather.data && weather.cities.length > 0 && (
          <p role="status" className="text-sm text-slate-300">
            Selecione uma cidade para consultar o clima.
          </p>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-500 sm:px-6 lg:px-8">
        Dados meteorológicos:{' '}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
        >
          Open-Meteo
        </a>{' '}
        (
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
        >
          CC BY 4.0
        </a>
        )
      </footer>
    </div>
  );
}
