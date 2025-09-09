import { useCallback, useMemo, useState } from 'react';
import type { CurrentWeather, ForecastResponse } from '../types/weather';

interface UseWeatherApiResult {
  isLoading: boolean;
  error: string | null;
  fetchCurrentByCity: (city: string) => Promise<CurrentWeather | null>;
  fetchForecastByCity: (city: string) => Promise<ForecastResponse | null>;
  fetchForecastWithPastByCity: (city: string, pastDays?: number) => Promise<ForecastResponse | null>;
  suggestCities: (query: string) => Promise<Array<{ name: string; country?: string; lat: number; lon: number }>>;
}

export function useWeatherApi(): UseWeatherApiResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const omUrlOverride = useMemo(() => process.env.REACT_APP_OPENMETEO_URL, []);

  const withRequest = useCallback(async <T,>(url: string): Promise<T> => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const REQUEST_TIMEOUT_MS = 8000;
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(url, { signal: controller.signal });
      } catch (e: any) {
        if (e?.name === 'AbortError') {
          throw new Error('Timeout: verzoek duurde te lang (8s). Probeer opnieuw.');
        }
        throw e;
      }
      clearTimeout(timeoutId);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      return (await res.json()) as T;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Removed Visual Crossing mapping. Open‑Meteo only.

  // Map Open-Meteo response to our types
  const mapOmToCurrent = (om: any): CurrentWeather => {
    let cur = om.current || {};
    // Fallback: if no current block, synthesize from first hourly entry
    if (!cur || Object.keys(cur).length === 0) {
      const t: string | undefined = om.hourly?.time?.[0];
      const temp: number | undefined = om.hourly?.temperature_2m?.[0];
      const wind: number | undefined = om.hourly?.wind_speed_10m?.[0];
      cur = {
        time: t,
        temperature_2m: temp,
        wind_speed_10m: wind,
      } as any;
    }
    return {
      name: `${om.latitude ?? ''},${om.longitude ?? ''}`,
      dt: cur.time ? Math.floor(new Date(cur.time).getTime() / 1000) : Math.floor(Date.now() / 1000),
      weather: [
        {
          id: 0,
          main: 'Current',
          description: 'Current conditions',
          icon: 'cloudy',
        },
      ],
      main: {
        temp: typeof cur.temperature_2m === 'number' ? cur.temperature_2m : 0,
        feels_like: typeof cur.temperature_2m === 'number' ? cur.temperature_2m : 0,
        temp_min: typeof cur.temperature_2m === 'number' ? cur.temperature_2m : 0,
        temp_max: typeof cur.temperature_2m === 'number' ? cur.temperature_2m : 0,
        pressure: 0,
        humidity: 0,
      },
      wind: {
        speed: typeof cur.wind_speed_10m === 'number' ? cur.wind_speed_10m : 0,
        deg: 0,
      },
      sys: {},
    };
  };

  const mapOmToForecast = (om: any): ForecastResponse => {
    const times: string[] = om.hourly?.time ?? [];
    const temps: number[] = om.hourly?.temperature_2m ?? [];
    const hums: number[] = om.hourly?.relative_humidity_2m ?? [];
    const winds: number[] = om.hourly?.wind_speed_10m ?? [];
    const list = times.map((t, idx) => ({
      dt: Math.floor(new Date(t).getTime() / 1000),
      main: {
        temp: typeof temps[idx] === 'number' ? temps[idx] : 0,
        feels_like: typeof temps[idx] === 'number' ? temps[idx] : 0,
        temp_min: typeof temps[idx] === 'number' ? temps[idx] : 0,
        temp_max: typeof temps[idx] === 'number' ? temps[idx] : 0,
        pressure: 0,
        humidity: typeof hums[idx] === 'number' ? hums[idx] : 0,
      },
      weather: [
        { id: 0, main: 'Hourly', description: 'Hourly forecast', icon: 'cloudy' },
      ],
      wind: { speed: typeof winds[idx] === 'number' ? winds[idx] : 0, deg: 0 },
      dt_txt: t,
    }));
    return {
      city: { name: `${om.latitude ?? ''},${om.longitude ?? ''}` },
      list,
    };
  };

  const buildOmUrl = (lat: number, lon: number, pastDays?: number) =>
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    (pastDays ? `&past_days=${pastDays}` : '') +
    `&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;

  const tryParseCoords = (input: string): { lat: number; lon: number } | null => {
    const m = input.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (!m) return null;
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { lat, lon };
    }
    return null;
  };

  const geocodeCityToLatLon = useCallback(async (city: string): Promise<{ lat: number; lon: number; label: string } | null> => {
    try {
      // Direct coordinates support: "52.37,4.90"
      const direct = tryParseCoords(city);
      if (direct) {
        // Reverse geocoding to resolve a human-readable name
        try {
          const revUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${direct.lat}&longitude=${direct.lon}&language=nl`;
          const rev = await withRequest<any>(revUrl);
          const first = rev?.results?.[0];
          const label = first ? [first.name, first.admin1, first.country].filter(Boolean).join(', ') : city.trim();
          return { ...direct, label };
        } catch {
          return { ...direct, label: city.trim() };
        }
      }

      const runSearch = async (q: string, language: string) => {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=${language}`;
        const res = await withRequest<any>(url);
        return (res?.results ?? []) as any[];
      };

      // Try NL first, then EN, then simplified query without commas
      let results: any[] = await runSearch(city, 'nl');
      if (!results.length) results = await runSearch(city, 'en');
      if (!results.length) {
        const simplified = city.split(',')[0].trim();
        if (simplified && simplified.toLowerCase() !== city.trim().toLowerCase()) {
          results = await runSearch(simplified, 'en');
        }
      }
      if (!results.length) return null;
      // Prefer exact name match (case-insensitive), otherwise highest population
      const lowered = city.trim().toLowerCase();
      const exact = results.find(r => String(r.name ?? '').toLowerCase() === lowered);
      const picked = exact ?? results.sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
      const labelParts = [picked.name, picked.admin1, picked.country].filter(Boolean);
      return { lat: picked.latitude, lon: picked.longitude, label: labelParts.join(', ') };
    } catch {
      return null;
    }
  }, [withRequest]);

  const suggestCities = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&language=nl`;
      const res = await withRequest<any>(url);
      const results: any[] = res?.results ?? [];
      return results.map((r) => ({ name: r.name, country: r.country, lat: r.latitude, lon: r.longitude }));
    } catch {
      return [];
    }
  }, [withRequest]);

  const resolveLabelFromOm = useCallback(async (om: any, fallback: string): Promise<string> => {
    try {
      const lat = om?.latitude;
      const lon = om?.longitude;
      if (typeof lat !== 'number' || typeof lon !== 'number') return fallback;
      const revUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=nl`;
      const rev = await withRequest<any>(revUrl);
      const first = rev?.results?.[0];
      return first ? [first.name, first.admin1, first.country].filter(Boolean).join(', ') : fallback;
    } catch {
      return fallback;
    }
  }, [withRequest]);

  const fetchCurrentByCity = useCallback(async (city: string) => {
    try {
      if (omUrlOverride) {
        const raw = await withRequest<any>(omUrlOverride);
        const mapped = mapOmToCurrent(raw);
        mapped.name = await resolveLabelFromOm(raw, mapped.name);
        return mapped;
      }
      const coords = await geocodeCityToLatLon(city);
      if (coords) {
        const url = buildOmUrl(coords.lat, coords.lon);
        const raw = await withRequest<any>(url);
        const mapped = mapOmToCurrent(raw);
        mapped.name = coords.label || city;
        return mapped;
      }
      throw new Error('Geen resultaten gevonden. Probeer een andere naam of kies uit de suggesties.');
    } catch (e: any) {
      setError(e.message ?? 'Onbekende fout');
      return null;
    }
  }, [omUrlOverride, withRequest, geocodeCityToLatLon]);

  const fetchForecastByCity = useCallback(async (city: string) => {
    try {
      if (omUrlOverride) {
        const raw = await withRequest<any>(omUrlOverride);
        const mapped = mapOmToForecast(raw);
        mapped.city.name = await resolveLabelFromOm(raw, mapped.city.name);
        return mapped;
      }
      // Fallback to Open-Meteo via geocoding for forecast
      const coords = await geocodeCityToLatLon(city);
      if (coords) {
        const url = buildOmUrl(coords.lat, coords.lon);
        const raw = await withRequest<any>(url);
        const mapped = mapOmToForecast(raw);
        mapped.city.name = coords.label || city;
        return mapped;
      }
      throw new Error('Geen resultaten gevonden. Probeer een andere naam of kies uit de suggesties.');
    } catch (e: any) {
      setError(e.message ?? 'Onbekende fout');
      return null;
    }
  }, [omUrlOverride, withRequest, geocodeCityToLatLon]);

  const fetchForecastWithPastByCity = useCallback(async (city: string, pastDays: number = 10) => {
    try {
      if (omUrlOverride) {
        const raw = await withRequest<any>(omUrlOverride);
        const mapped = mapOmToForecast(raw);
        mapped.city.name = await resolveLabelFromOm(raw, mapped.city.name);
        return mapped;
      }
      const coords = await geocodeCityToLatLon(city);
      if (coords) {
        const url = buildOmUrl(coords.lat, coords.lon, pastDays);
        const raw = await withRequest<any>(url);
        const mapped = mapOmToForecast(raw);
        mapped.city.name = coords.label || city;
        return mapped;
      }
      throw new Error('Geen resultaten gevonden. Probeer een andere naam of kies uit de suggesties.');
    } catch (e: any) {
      setError(e.message ?? 'Onbekende fout');
      return null;
    }
  }, [omUrlOverride, withRequest, geocodeCityToLatLon]);

  return { isLoading, error, fetchCurrentByCity, fetchForecastByCity, fetchForecastWithPastByCity, suggestCities };
}

export default useWeatherApi;


