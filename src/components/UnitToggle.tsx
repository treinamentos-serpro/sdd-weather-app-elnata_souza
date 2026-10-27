import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, buttonUnit: Unit) {
    let nextUnit: Unit | undefined;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextUnit = buttonUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextUnit = buttonUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        break;
      case 'Home':
        nextUnit = 'celsius';
        break;
      case 'End':
        nextUnit = 'fahrenheit';
        break;
      default:
        return;
    }

    event.preventDefault();
    onChange(nextUnit);

    if (nextUnit === 'celsius') {
      celsiusButtonRef.current?.focus();
    } else {
      fahrenheitButtonRef.current?.focus();
    }
  }

  const buttonClassName = (pressed: boolean) =>
    `min-w-10 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${
      pressed ? 'bg-accent-500 text-white' : 'text-slate-300 hover:bg-white/10'
    }`;

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        tabIndex={unit === 'celsius' ? 0 : -1}
        className={buttonClassName(unit === 'celsius')}
        onClick={() => onChange('celsius')}
        onKeyDown={(event) => handleKeyDown(event, 'celsius')}
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        className={buttonClassName(unit === 'fahrenheit')}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={(event) => handleKeyDown(event, 'fahrenheit')}
      >
        °F
      </button>
    </div>
  );
}
