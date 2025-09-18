import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import useWeatherApi from '../hooks/useWeatherApi';
import { Dropdown } from 'primereact/dropdown';

export type SearchFormHandle = {
  clearAll: () => void;
};

interface Props {
  onSearch: (city: string) => void;
  isLoading?: boolean;
}

const SearchForm = forwardRef<SearchFormHandle, Props>(({ onSearch, isLoading }, ref) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; country?: string; lat: number; lon: number }>>([]);
  const [country, setCountry] = useState<string | null>(null);
  const { suggestCities } = useWeatherApi();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  const handleClear = () => setQuery('');

  useImperativeHandle(ref, () => ({
    clearAll: () => {
      setQuery('');
      setCountry(null);
      setSuggestions([]);
    },
  }), []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        // no-op; AutoComplete manages its own overlay
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
        <Tooltip target=".search-input" content="Typ ten minste 2 letters" position="top" />
        <div className="p-inputgroup" style={{ flex: 1 }}>
          <span className="p-inputgroup-addon">
            <i className="pi pi-search" />
          </span>
          <AutoComplete
            className="search-input"
            value={query}
            suggestions={suggestions.map(s => ({ ...s, label: s.country ? `${s.name}, ${s.country}` : s.name }))}
            completeMethod={async (e) => {
              const q = String(e.query ?? '').trim();
              if (q.length < 2) { setSuggestions([]); return; }
              const res = await suggestCities(q, country || undefined);
              setSuggestions(res);
            }}
            field="label"
            onChange={(e) => setQuery(String(e.value ?? ''))}
            onSelect={(e) => { const val = (e.value as any)?.name || String(e.value); setQuery(val); }}
            placeholder="Zoek stad..."
            aria-label="Zoek stad"
            inputStyle={{ padding: 8, width: '100%' }}
            style={{ width: '100%' }}
          />
          {query && (
            <span className="p-inputgroup-addon" style={{ cursor: 'pointer' }} onClick={handleClear} aria-label="Wissen">
              <i className="pi pi-times" />
            </span>
          )}
        </div>
        <Dropdown
          value={country}
          onChange={(e) => setCountry((e.value as string | null) || null)}
          options={COUNTRIES}
          optionLabel="label"
          optionValue="code"
          placeholder="Land"
          showClear
          style={{ width: 140 }}
          aria-label="Filter op land"
        />
        <Button type="submit" label={isLoading ? 'Zoeken...' : 'Zoeken'} icon="pi pi-send" rounded outlined disabled={!!isLoading} />
      </form>
    </div>
  );
});

export default SearchForm;

// ISO 3166-1 alpha-2 codes supported by Open‑Meteo geocoding `country` param
const COUNTRIES = [
  { code: 'NL', label: 'Nederland' },
  { code: 'BE', label: 'België' },
  { code: 'DE', label: 'Duitsland' },
  { code: 'FR', label: 'Frankrijk' },
  { code: 'ES', label: 'Spanje' },
  { code: 'IT', label: 'Italië' },
  { code: 'GB', label: 'Verenigd Koninkrijk' },
  { code: 'US', label: 'Verenigde Staten' },
  { code: 'CA', label: 'Canada' },
];


