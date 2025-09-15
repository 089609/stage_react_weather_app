import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import SearchForm from '../components/SearchForm';
import WeatherTable from '../components/WeatherTable';
import useWeatherApi from '../hooks/useWeatherApi';
import type { CurrentWeather } from '../types/weather';

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
      <h1>Weer Overzicht</h1>
      <SearchForm onSearch={handleSearch} isLoading={isLoading || mutation.isPending} />
      {error && (
        <div style={{ color: 'crimson', marginTop: 8 }}>Fout: {error}</div>
      )}
      <WeatherTable items={items} />
    </section>
  );
};

export default Home;


