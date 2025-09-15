import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useCurrentWeather from '../hooks/useCurrentWeather';
import useForecast from '../hooks/useForecast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const CityDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const location = useLocation() as { state?: { label?: string } };
  const currentQuery = useCurrentWeather(name);
  const forecastQuery = useForecast(name, 10);

  const isLoading = currentQuery.isLoading || forecastQuery.isLoading;
  const error = (currentQuery.error as any)?.message || (forecastQuery.error as any)?.message || null;
  const current = currentQuery.data ?? null;
  const forecast = forecastQuery.data ?? null;
  const displayName = location.state?.label ?? forecast?.city?.name ?? name;

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

      {forecast && (() => {
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
        const dateTemplate = (row: any) => new Date(row.date).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const round = (n: number) => Math.round(n);
        return (
          <div style={{ marginTop: 16 }}>
            <h2>Gemiddelde temperatuur (volgende 5 dagen)</h2>
            <DataTable value={daily} dataKey="date" responsiveLayout="scroll" size="small">
              <Column header="Datum" body={dateTemplate} sortable></Column>
              <Column header="Gem. temperatuur (°C)" field="avgTemp" body={(r) => round(r.avgTemp)} sortable></Column>
              <Column header="Gem. luchtvochtigheid (%)" field="avgHum" body={(r) => round(r.avgHum)} sortable></Column>
              <Column header="Gem. wind (km/h)" field="avgWind" body={(r) => round(r.avgWind)} sortable></Column>
            </DataTable>
          </div>
        );
      })()}
    </section>
  );
};

export default CityDetail;


