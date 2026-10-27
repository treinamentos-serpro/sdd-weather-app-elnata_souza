import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('formatação de datas', () => {
  it('rotula o primeiro e o segundo dia como hoje e amanhã', () => {
    expect(getDayLabel('2026-06-16', 0)).toBe('Hoje');
    expect(getDayLabel('2026-06-17', 1)).toBe('Amanhã');
  });

  it('usa o dia da semana nos demais índices', () => {
    expect(getDayLabel('2026-06-18', 2)).toBe('Qui');
    expect(getDayLabel('2026-06-19', 4)).toBe('Sex');
  });

  it('formata a data curta com dia e mês abreviado', () => {
    expect(getShortDate('2026-06-16')).toBe('16 Jun');
  });
});
