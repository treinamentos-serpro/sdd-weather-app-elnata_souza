import { fireEvent, render, screen } from '@testing-library/react';
import EmptyState from '../../../src/components/states/EmptyState';
import ErrorState from '../../../src/components/states/ErrorState';
import LoadingState from '../../../src/components/states/LoadingState';

describe('shared states', () => {
  it('announces loading with a status role', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('announces an error and calls retry when requested', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Falha de conexão." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha de conexão.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows an empty-state title and hint', () => {
    render(<EmptyState title="Nenhuma cidade encontrada" hint="Tente outra busca." />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Nenhuma cidade encontrada');
    expect(status).toHaveTextContent('Tente outra busca.');
  });
});
