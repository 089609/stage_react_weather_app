import { useQuery } from '@tanstack/react-query';
import useWeatherApi from './useWeatherApi';
import type { ForecastResponse } from '../types/weather';

export function useForecast(cityName?: string | null, pastDays: number = 10) {
  const { fetchForecastWithPastByCity } = useWeatherApi();
  return useQuery<ForecastResponse | null>({
    queryKey: ['forecast', cityName, pastDays],
    queryFn: () => (cityName ? fetchForecastWithPastByCity(cityName, pastDays) : Promise.resolve(null)),
    enabled: !!cityName,
  });
}

export default useForecast;


