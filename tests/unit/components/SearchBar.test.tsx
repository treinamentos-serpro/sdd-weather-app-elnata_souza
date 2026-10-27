import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import SearchBar from '../../../src/components/SearchBar';
import { mockCity } from '../../../src/mocks/weather';

function SearchHarness({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <SearchBar
      query={query}
      onQueryChange={setQuery}
      onSearch={onSearch}
      onSelectCity={vi.fn()}
      cities={[]}
      isLoading={false}
    />
  );
}

describe('SearchBar', () => {
  it.each([
    '',
    '   ',
    'a',
  ])('não dispara onSearch para entrada inválida %j por botão ou Enter', async (query) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchHarness onSearch={onSearch} />);

    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    if (query) await user.type(input, query);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite pelo menos 2 caracteres.');

    await user.click(input);
    await user.keyboard('{Enter}');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('envia o termo aparado com acentos ao clicar em Buscar', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchHarness onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.type(screen.getByLabelText('Buscar cidade'), '  São Paulo  ');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('submits the search from the keyboard and exposes an accessible input', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <SearchBar
        query="Lisboa"
        onQueryChange={vi.fn()}
        onSearch={onSearch}
        onSelectCity={vi.fn()}
        cities={[]}
        isLoading={false}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });
    input.focus();
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Lisboa');
  });

  it('renders city details and selects a result by keyboard', async () => {
    const user = userEvent.setup();
    const onSelectCity = vi.fn();
    render(
      <SearchBar
        query="Lisboa"
        onQueryChange={vi.fn()}
        onSearch={vi.fn()}
        onSelectCity={onSelectCity}
        cities={[mockCity]}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Portugal')).toBeInTheDocument();
    const option = screen.getByRole('button', { name: /Selecionar Lisboa/ });
    option.focus();
    await user.keyboard(' ');

    expect(onSelectCity).toHaveBeenCalledWith(mockCity);
  });
});
