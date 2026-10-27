import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitToggle from '../../../src/components/UnitToggle';
import type { Unit } from '../../../src/types/weather';

describe('UnitToggle', () => {
  it('exposes the selected unit and provides one tab stop', () => {
    render(<UnitToggle unit="celsius" onChange={() => {}} />);

    const group = screen.getByRole('group', { name: 'Unidade de temperatura' });
    const celsiusButton = screen.getByRole('button', { name: 'Celsius' });
    const fahrenheitButton = screen.getByRole('button', { name: 'Fahrenheit' });

    expect(group).toContainElement(celsiusButton);
    expect(group).toContainElement(fahrenheitButton);
    expect(celsiusButton).toHaveAttribute('aria-pressed', 'true');
    expect(fahrenheitButton).toHaveAttribute('aria-pressed', 'false');
    expect(celsiusButton).toHaveAttribute('tabindex', '0');
    expect(fahrenheitButton).toHaveAttribute('tabindex', '-1');
  });

  it('reports button selection through onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(unit: Unit) => void>();

    render(<UnitToggle unit="celsius" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('moves focus and selection with arrow and endpoint keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(unit: Unit) => void>();

    render(<UnitToggle unit="celsius" onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');

    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('celsius');

    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');
  });
});
