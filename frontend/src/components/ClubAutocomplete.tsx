import { useState, useRef, useEffect } from 'react';
import { searchClubs } from '../utils/clubThemes';

interface Props {
  id: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function ClubAutocomplete({ id, name, value, placeholder, required, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    const results = searchClubs(val);
    setSuggestions(results);
    setOpen(results.length > 0);
    setActiveIndex(-1);
  }

  function handleSelect(club: string) {
    onChange(club);
    setSuggestions([]);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="autocomplete-wrapper" ref={containerRef}>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          const results = searchClubs(value);
          if (results.length > 0) { setSuggestions(results); setOpen(true); }
        }}
      />
      {open && (
        <ul className="autocomplete-dropdown">
          {suggestions.map((club, i) => (
            <li
              key={club}
              className={`autocomplete-item${i === activeIndex ? ' active' : ''}`}
              onMouseDown={() => handleSelect(club)}
            >
              {club}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
