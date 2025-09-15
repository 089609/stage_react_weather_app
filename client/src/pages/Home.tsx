import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import SearchForm from '../components/SearchForm';
import WeatherTable from '../components/WeatherTable';
import useWeatherApi from '../hooks/useWeatherApi';
import type { CurrentWeather } from '../types/weather';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';

const Home: React.FC = () => {
  const { isLoading, error, fetchCurrentByCity } = useWeatherApi();
  const [items, setItems] = useState<CurrentWeather[]>([]);

  const mutation = useMutation({
    mutationFn: (city: string) => fetchCurrentByCity(city),
    onSuccess: (data) => {
      if (!data) return;
      setItems((prev) => {
        const filtered = prev.filter((p) => p.name.toLowerCase() !== data.name.toLowerCase());
        return [data, ...filtered];
      });
    },
  });

  const handleSearch = (city: string) => mutation.mutate(city);

  return (
    <section style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <Card title="Weer Overzicht">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SearchForm onSearch={handleSearch} isLoading={isLoading || mutation.isPending} />
          {(isLoading || mutation.isPending) && (
            <ProgressSpinner style={{ width: 28, height: 28 }} strokeWidth="6" />
          )}
        </div>
        {error && (
          <div style={{ marginTop: 8 }}>
            <Message severity="error" text={`Fout: ${error}`} />
          </div>
        )}
        {items.length === 0 ? (
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


