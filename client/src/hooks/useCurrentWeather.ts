import { useQuery } from '@tanstack/react-query';
import useWeatherApi from './useWeatherApi';
import type { CurrentWeather } from '../types/weather';

export function useCurrentWeather(cityName?: string | null) {
  const { fetchCurrentByCity } = useWeatherApi();
  return useQuery<CurrentWeather | null>({
    queryKey: ['current', cityName],
    queryFn: () => (cityName ? fetchCurrentByCity(cityName) : Promise.resolve(null)),
    enabled: !!cityName,
  });
}

export default useCurrentWeather;


