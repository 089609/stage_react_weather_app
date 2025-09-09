import React, { useEffect, useRef, useState } from 'react';
import useWeatherApi from '../hooks/useWeatherApi';

interface Props {
  onSearch: (city: string) => void;
  isLoading?: boolean;
}

const SearchForm: React.FC<Props> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; country?: string; lat: number; lon: number }>>([]);
  const [open, setOpen] = useState(false);
  const { suggestCities } = useWeatherApi();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
    setOpen(false);
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      const q = query.trim();
      if (q.length < 2) {
        if (active) setSuggestions([]);
        return;
      }
      const res = await suggestCities(q);
      if (active) {
        setSuggestions(res);
        setOpen(true);
      }
    };
    const id = setTimeout(run, 250); // debounce
    return () => { active = false; clearTimeout(id); };
  }, [query, suggestCities]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek stad..."
          aria-label="Zoek stad"
          style={{ padding: 8, flex: 1, minWidth: 200 }}
          onFocus={() => suggestions.length && setOpen(true)}
        />
        <button type="submit" disabled={isLoading} style={{ padding: '8px 12px' }}>
          {isLoading ? 'Zoeken...' : 'Zoeken'}
        </button>
      </form>
      {open && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          zIndex: 10,
          marginTop: 4,
          listStyle: 'none',
          padding: 0,
          width: '100%',
          maxHeight: 240,
          overflowY: 'auto',
          border: '1px solid #ddd',
          background: 'white',
          boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
        }}>
          {suggestions.map((s, idx) => (
            <li key={`${s.name}-${idx}`}>
              <button
                type="button"
                onClick={() => { setQuery(s.name); onSearch(`${s.name}`); setOpen(false); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                {s.name}{s.country ? `, ${s.country}` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchForm;


