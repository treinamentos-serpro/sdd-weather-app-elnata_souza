import { useState } from 'react';
import type { City } from '../types/weather';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  onSelectCity: (city: City) => void;
  cities: City[];
  isLoading: boolean;
  validationMessage?: string;
}

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  onSelectCity,
  cities,
  isLoading,
  validationMessage,
}: SearchBarProps) {
  const [inputError, setInputError] = useState<string>();
  const errorMessage = inputError ?? validationMessage;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setInputError('Digite pelo menos 2 caracteres.');
      return;
    }

    setInputError(undefined);
    onSearch(trimmedQuery);
  }

  return (
    <form className="min-w-0 w-full" onSubmit={handleSubmit} role="search">
      <div className="flex min-w-0 gap-2">
        <label className="sr-only" htmlFor="city-search">
          Buscar cidade
        </label>
        <input
          id="city-search"
          type="search"
          value={query}
          onChange={(event) => {
            setInputError(undefined);
            onQueryChange(event.currentTarget.value);
          }}
          placeholder="Buscar cidade"
          disabled={isLoading}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="shrink-0 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-wait disabled:opacity-60"
        >
          Buscar
        </button>
      </div>
      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}
      {cities.length > 0 && (
        <ul
          aria-label="Resultados da busca"
          className="mt-3 space-y-2 rounded-lg border border-white/10 bg-night-800 p-2"
        >
          {cities.map((city) => {
            const details = [city.admin1, city.country].filter(
              (value): value is string => value !== null && value !== city.name,
            );
            const key = `${city.id ?? 'sem-id'}-${city.latitude}-${city.longitude}`;

            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSelectCity(city)}
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
                  aria-label={`Selecionar ${city.name}${details.length ? `, ${details.join(', ')}` : ''}`}
                >
                  <span className="block font-medium text-white">{city.name}</span>
                  {details.length > 0 && (
                    <span className="block text-xs text-slate-300">{details.join(', ')}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </form>
  );
}
