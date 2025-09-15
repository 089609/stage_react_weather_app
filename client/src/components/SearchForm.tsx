import React, { useEffect, useRef, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
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
        <AutoComplete
          value={query}
          suggestions={suggestions.map(s => ({ ...s, label: s.country ? `${s.name}, ${s.country}` : s.name }))}
          completeMethod={async (e) => {
            const q = String(e.query ?? '').trim();
            if (q.length < 2) { setSuggestions([]); return; }
            const res = await suggestCities(q);
            setSuggestions(res);
            setOpen(true);
          }}
          field="label"
          onChange={(e) => setQuery(String(e.value ?? ''))}
          onSelect={(e) => { const val = (e.value as any)?.name || String(e.value); setQuery(val); onSearch(val); setOpen(false); }}
          placeholder="Zoek stad..."
          aria-label="Zoek stad"
          inputStyle={{ padding: 8, width: '100%' }}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Button type="submit" label={isLoading ? 'Zoeken...' : 'Zoeken'} disabled={!!isLoading} />
      </form>
    </div>
  );
};

export default SearchForm;


