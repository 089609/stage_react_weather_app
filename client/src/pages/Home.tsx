import React, { useState } from 'react';
import SearchForm from '../components/SearchForm';
import WeatherTable from '../components/WeatherTable';
import useWeatherApi from '../hooks/useWeatherApi';
import type { CurrentWeather } from '../types/weather';

const Home: React.FC = () => {
  const { isLoading, error, fetchCurrentByCity } = useWeatherApi();
  const [items, setItems] = useState<CurrentWeather[]>([]);

  const handleSearch = async (city: string) => {
    const data = await fetchCurrentByCity(city);
    if (data) {
      setItems((prev) => {
        const filtered = prev.filter((p) => p.name.toLowerCase() !== data.name.toLowerCase());
        return [data, ...filtered];
      });
    }
  };

  return (
    <section style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Weer Overzicht</h1>
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      {error && (
        <div style={{ color: 'crimson', marginTop: 8 }}>Fout: {error}</div>
      )}
      <WeatherTable items={items} />
    </section>
  );
};

export default Home;


