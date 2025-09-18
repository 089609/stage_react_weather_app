import React, { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import SearchForm, { SearchFormHandle } from '../components/SearchForm';
import WeatherTable from '../components/WeatherTable';
import useWeatherApi from '../hooks/useWeatherApi';
import type { CurrentWeather } from '../types/weather';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';

const Home: React.FC = () => {
  const { isLoading, error, fetchCurrentByCity } = useWeatherApi();
  const [items, setItems] = useState<CurrentWeather[]>([]);
  const [lastQuery, setLastQuery] = useState<string>('');
  const toastRef = useRef<Toast | null>(null);
  const searchFormRef = useRef<SearchFormHandle | null>(null);

  const mutation = useMutation({
    mutationFn: (city: string) => fetchCurrentByCity(city),
    onSuccess: (data) => {
      if (!data) return;
      setItems((prev) => {
        const filtered = prev.filter((p) => p.name.toLowerCase() !== data.name.toLowerCase());
        return [data, ...filtered];
      });
      toastRef.current?.show({ severity: 'success', summary: 'Toegevoegd', detail: `${data.name} bijgewerkt`, life: 2000 });
    },
    onError: (err: any) => {
      const detail = typeof err === 'string' ? err : err?.message || 'Onbekende fout';
      toastRef.current?.show({ severity: 'error', summary: 'Fout', detail, life: 3000 });
    }
  });

  const handleSearch = (city: string) => {
    setLastQuery(city);
    mutation.mutate(city);
  };

  const left = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <i className="pi pi-cloud" />
      <span style={{ fontWeight: 600 }}>Weer Overzicht</span>
    </div>
  );
  const right = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button label="Refresh" icon="pi pi-refresh" outlined onClick={() => {
        if (lastQuery) {
          handleSearch(lastQuery);
        } else if (items.length) {
          handleSearch(items[0].name);
        }
      }} />
      <Button label="Wissen" icon="pi pi-trash" severity="secondary" outlined onClick={() => {
        setItems([]);
        setLastQuery('');
        searchFormRef.current?.clearAll();
      }} />
    </div>
  );

  return (
    <section style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <Toast ref={toastRef} />
      <Card>
        <Toolbar start={left} end={right} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <SearchForm ref={searchFormRef} onSearch={handleSearch} isLoading={isLoading || mutation.isPending} />
          {(isLoading || mutation.isPending) && (
            <ProgressSpinner style={{ width: 28, height: 28 }} strokeWidth="6" />
          )}
        </div>
        {error && (
          <div style={{ marginTop: 8 }}>
            <Message severity="error" text={`Fout: ${error}`} />
          </div>
        )}
        {items.length === 0 && (isLoading || mutation.isPending) ? (
          <div style={{ marginTop: 12 }}>
            <Skeleton height="2.5rem" className="mb-2" />
            <Skeleton height="8rem" />
          </div>
        ) : items.length === 0 ? (
          <div style={{ marginTop: 12 }}>
            <Message severity="info" text="Zoek naar een stad om te beginnen." />
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <WeatherTable items={items} />
          </div>
        )}
      </Card>
    </section>
  );
};

export default Home;


