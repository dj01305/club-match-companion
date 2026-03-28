import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ClubAutocomplete from '../components/ClubAutocomplete';

// Helper to render the component with sensible defaults
function renderAutocomplete(onChange = vi.fn(), value = '') {
  return render(
    <ClubAutocomplete
      id="club"
      name="club"
      value={value}
      placeholder="Search clubs…"
      onChange={onChange}
    />
  );
}

describe('ClubAutocomplete', () => {
  describe('dropdown visibility', () => {
    test('shows suggestions when the user types a matching query', async () => {
      const onChange = vi.fn();
      const { rerender } = renderAutocomplete(onChange, '');

      await userEvent.type(screen.getByRole('textbox'), 'ars');

      // Simulate the parent updating the value prop (as it would in real usage)
      rerender(
        <ClubAutocomplete id="club" name="club" value="ars" placeholder="Search clubs…" onChange={onChange} />
      );

      expect(screen.getByText('Arsenal')).toBeInTheDocument();
    });

    test('does not show a dropdown when the input is empty', () => {
      renderAutocomplete(vi.fn(), '');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('closes the dropdown when Escape is pressed', async () => {
      const onChange = vi.fn();
      const { rerender } = renderAutocomplete(onChange, '');

      await userEvent.type(screen.getByRole('textbox'), 'ars');
      rerender(
        <ClubAutocomplete id="club" name="club" value="ars" placeholder="Search clubs…" onChange={onChange} />
      );

      expect(screen.getByText('Arsenal')).toBeInTheDocument();

      await userEvent.keyboard('{Escape}');
      expect(screen.queryByText('Arsenal')).not.toBeInTheDocument();
    });
  });

  describe('selecting a suggestion', () => {
    test('calls onChange with the club name when a suggestion is clicked', async () => {
      const onChange = vi.fn();
      const { rerender } = renderAutocomplete(onChange, '');

      await userEvent.type(screen.getByRole('textbox'), 'ars');
      rerender(
        <ClubAutocomplete id="club" name="club" value="ars" placeholder="Search clubs…" onChange={onChange} />
      );

      await userEvent.click(screen.getByText('Arsenal'));
      expect(onChange).toHaveBeenCalledWith('Arsenal');
    });

    test('closes the dropdown after a suggestion is clicked', async () => {
      const onChange = vi.fn();
      const { rerender } = renderAutocomplete(onChange, '');

      await userEvent.type(screen.getByRole('textbox'), 'ars');
      rerender(
        <ClubAutocomplete id="club" name="club" value="ars" placeholder="Search clubs…" onChange={onChange} />
      );

      await userEvent.click(screen.getByText('Arsenal'));
      expect(screen.queryByText('Arsenal')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    test('ArrowDown highlights the first suggestion', async () => {
      const onChange = vi.fn();
      const { rerender } = renderAutocomplete(onChange, '');

      await userEvent.type(screen.getByRole('textbox'), 'man');
      rerender(
        <ClubAutocomplete id="club" name="club" value="man" placeholder="Search clubs…" onChange={onChange} />
      );

      await userEvent.keyboard('{ArrowDown}');
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveClass('active');
    });

    test('Enter selects the highlighted suggestion', async () => {
      const onChange = vi.fn();
      const { rerender } = renderAutocomplete(onChange, '');

      await userEvent.type(screen.getByRole('textbox'), 'man');
      rerender(
        <ClubAutocomplete id="club" name="club" value="man" placeholder="Search clubs…" onChange={onChange} />
      );

      // Read the first suggestion from the DOM so the assertion isn't brittle
      // if the club list order ever changes
      const firstSuggestion = screen.getAllByRole('listitem')[0].textContent!;

      onChange.mockClear();

      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(firstSuggestion);
    });
  });
});
