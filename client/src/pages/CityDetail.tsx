import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useCurrentWeather from '../hooks/useCurrentWeather';
import useForecast from '../hooks/useForecast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

const CityDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const location = useLocation() as { state?: { label?: string } };
  const { isLoading: isLoadingCurrentWeather, error: errorCurrentWeather, data: currentWeatherData } = useCurrentWeather(name);
  const { isLoading: isLoadingForecast, error: errorForecast, data: forecastData } = useForecast(name, 10);

  const isLoading = isLoadingCurrentWeather || isLoadingForecast;
  const error = (errorCurrentWeather as any)?.message || (errorForecast as any)?.message || null;
  const current = currentWeatherData ?? null;
  const forecast = forecastData ?? null;
  const displayName = location.state?.label ?? forecast?.city?.name ?? name;

  return (
    <section style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <Card title={`Details voor: ${displayName}`}>
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
            <ProgressSpinner style={{ width: 40, height: 40 }} strokeWidth="6" />
          </div>
        )}
        {error && (
          <div style={{ marginTop: 8 }}>
            <Message severity="error" text={`Fout: ${error}`} />
          </div>
        )}

        {current && (
          <div style={{ marginTop: 12 }}>
            <Card title="Huidig weer">
              <div>Temperatuur: {Math.round(current.main.temp)}°C</div>
              <div>Gevoelstemperatuur: {Math.round(current.main.feels_like)}°C</div>
              <div>Wind: {current.wind?.speed ?? '-'} m/s</div>
            </Card>
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
              <Card title="Gemiddelde temperatuur (volgende 5 dagen)">
                <DataTable value={daily} dataKey="date" responsiveLayout="scroll" size="small" emptyMessage="Geen gegevens">
                  <Column header="Datum" body={dateTemplate} sortable></Column>
                  <Column header="Gem. temperatuur (°C)" field="avgTemp" body={(r) => round(r.avgTemp)} sortable></Column>
                  <Column header="Gem. luchtvochtigheid (%)" field="avgHum" body={(r) => round(r.avgHum)} sortable></Column>
                  <Column header="Gem. wind (km/h)" field="avgWind" body={(r) => round(r.avgWind)} sortable></Column>
                </DataTable>
              </Card>
            </div>
          );
        })()}
      </Card>
    </section>
  );
};

export default CityDetail;


