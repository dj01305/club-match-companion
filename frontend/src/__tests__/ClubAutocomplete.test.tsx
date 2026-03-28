import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useState } from 'react';
import ClubAutocomplete from '../components/ClubAutocomplete';

// Stateful wrapper that mirrors how the component is used in the real app —
// the parent updates the value prop on every keystroke via onChange
function StatefulAutocomplete({ onChange = vi.fn() }: { onChange?: ReturnType<typeof vi.fn> }) {
  const [value, setValue] = useState('');
  return (
    <ClubAutocomplete
      id="club"
      name="club"
      value={value}
      placeholder="Search clubs…"
      onChange={val => { setValue(val); onChange(val); }}
    />
  );
}

// Helper for tests that don't need to spy on onChange
function renderAutocomplete(onChange = vi.fn()) {
  return render(<StatefulAutocomplete onChange={onChange} />);
}

describe('ClubAutocomplete', () => {
  describe('dropdown visibility', () => {
    test('shows suggestions when the user types a matching query', async () => {
      renderAutocomplete();
      await userEvent.type(screen.getByRole('textbox'), 'arsenal');
      expect(screen.getByText('Arsenal')).toBeInTheDocument();
    });

    test('does not show a dropdown when the input is empty', () => {
      renderAutocomplete();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('closes the dropdown when Escape is pressed', async () => {
      renderAutocomplete();
      await userEvent.type(screen.getByRole('textbox'), 'arsenal');
      expect(screen.getByText('Arsenal')).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByText('Arsenal')).not.toBeInTheDocument();
    });
  });

  describe('selecting a suggestion', () => {
    test('calls onChange with the club name when a suggestion is clicked', async () => {
      const onChange = vi.fn();
      renderAutocomplete(onChange);
      await userEvent.type(screen.getByRole('textbox'), 'arsenal');
      onChange.mockClear();
      await userEvent.click(screen.getByText('Arsenal'));
      expect(onChange).toHaveBeenCalledWith('Arsenal');
    });

    test('closes the dropdown after a suggestion is clicked', async () => {
      renderAutocomplete();
      await userEvent.type(screen.getByRole('textbox'), 'arsenal');
      await userEvent.click(screen.getByText('Arsenal'));
      expect(screen.queryByText('Arsenal')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    test('ArrowDown highlights the first suggestion', async () => {
      renderAutocomplete();
      await userEvent.type(screen.getByRole('textbox'), 'man');
      await userEvent.keyboard('{ArrowDown}');
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveClass('active');
    });

    test('Enter selects the highlighted suggestion', async () => {
      const onChange = vi.fn();
      renderAutocomplete(onChange);
      await userEvent.type(screen.getByRole('textbox'), 'man');

      const firstSuggestion = screen.getAllByRole('listitem')[0].textContent!;
      onChange.mockClear();

      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(firstSuggestion);
    });
  });
});
