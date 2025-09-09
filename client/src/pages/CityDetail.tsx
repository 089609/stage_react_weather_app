import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useWeatherApi from '../hooks/useWeatherApi';
import type { CurrentWeather, ForecastResponse } from '../types/weather';

const CityDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const location = useLocation() as { state?: { label?: string } };
  const { isLoading, error, fetchCurrentByCity, fetchForecastByCity, fetchForecastWithPastByCity } = useWeatherApi();
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const displayName = location.state?.label ?? forecast?.city?.name ?? name;

  useEffect(() => {
    if (!name) return;
    (async () => {
      const [c, f] = await Promise.all([
        fetchCurrentByCity(name),
        fetchForecastWithPastByCity(name, 10),
      ]);
      setCurrent(c);
      setForecast(f);
    })();
  }, [name, fetchCurrentByCity, fetchForecastByCity, fetchForecastWithPastByCity]);

  return (
    <section style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Details voor: {displayName}</h1>
      {isLoading && <div>Bezig met laden...</div>}
      {error && <div style={{ color: 'crimson' }}>Fout: {error}</div>}

      {current && (
        <div style={{ marginTop: 12 }}>
          <h2>Huidig weer</h2>
          <div>Temperatuur: {Math.round(current.main.temp)}°C</div>
          <div>Gevoelstemperatuur: {Math.round(current.main.feels_like)}°C</div>
          <div>Wind: {current.wind?.speed ?? '-'} m/s</div>
        </div>
      )}

      {forecast && (
        <div style={{ marginTop: 16 }}>
          <h2>Gemiddelde temperatuur (volgende 5 dagen)</h2>
          {(() => {
            const nowSec = Math.floor(Date.now() / 1000);
            const future = forecast.list.filter((i) => i.dt >= nowSec);
            const byDay = new Map<string, { tempSum: number; humSum: number; windSum: number; count: number }>();
            for (const item of future) {
              const d = new Date(item.dt * 1000);
              const key = d.toISOString().slice(0, 10);
              const entry = byDay.get(key) ?? { tempSum: 0, humSum: 0, windSum: 0, count: 0 };
              entry.tempSum += item.main.temp;
              entry.humSum += typeof item.main.humidity === 'number' ? item.main.humidity : 0;
              entry.windSum += typeof item.wind?.speed === 'number' ? item.wind.speed : 0;
              entry.count += 1;
              byDay.set(key, entry);
            }
            const daily = Array.from(byDay.entries())
              .sort((a, b) => (a[0] < b[0] ? -1 : 1))
              .slice(0, 5)
              .map(([key, v]) => ({
                date: key,
                avgTemp: v.count ? v.tempSum / v.count : 0,
                avgHum: v.count ? v.humSum / v.count : 0,
                avgWind: v.count ? v.windSum / v.count : 0,
              }));
            return (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Datum</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Gem. temperatuur (°C)</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Gem. luchtvochtigheid (%)</th>
                      <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Gem. wind (km/h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.map((d) => (
                      <tr key={d.date}>
                        <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                          {new Date(d.date).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{Math.round(d.avgTemp)}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{Math.round(d.avgHum)}</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{Math.round(d.avgWind)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
};

export default CityDetail;


