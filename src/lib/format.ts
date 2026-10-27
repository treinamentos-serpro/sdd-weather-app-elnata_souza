const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function parseLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getDayLabel(iso: string, index: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  return WEEKDAYS[parseLocalDate(iso).getDay()];
}

export function getShortDate(iso: string): string {
  const date = parseLocalDate(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatDayLabel(localDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);

  if (!match) {
    return 'Data indisponível';
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    weekday: 'long',
  }).format(date);
}
