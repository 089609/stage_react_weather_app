import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import type { CurrentWeather } from '../types/weather';

interface Props {
  items: CurrentWeather[];
}

const WeatherTable: React.FC<Props> = ({ items }) => {
  if (!items.length) return null;

  const nameTemplate = (w: CurrentWeather) => (
    <Link to={`/city/${encodeURIComponent(w.name)}`} state={{ label: w.name }}>{w.name}</Link>
  );
  const tempTemplate = (w: CurrentWeather) => Math.round(w.main.temp);
  const descTemplate = (w: CurrentWeather) => (w.weather?.[0]?.description ?? '-');
  const windTemplate = (w: CurrentWeather) => (w.wind?.speed ?? '-');

  return (
    <div style={{ marginTop: 12 }}>
      <DataTable value={items} dataKey="dt" responsiveLayout="scroll" size="small" paginator rows={5} rowsPerPageOptions={[5,10,20]}>
        <Column header="Stad" body={nameTemplate} sortable></Column>
        <Column header="Temperatuur (°C)" body={tempTemplate} sortable></Column>
        <Column header="Omschrijving" body={descTemplate}></Column>
        <Column header="Wind (m/s)" body={windTemplate} sortable></Column>
      </DataTable>
    </div>
  );
};

export default WeatherTable;


