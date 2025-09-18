import React from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import type { CurrentWeather } from '../types/weather';

interface Props {
  items: CurrentWeather[];
}

const WeatherTable: React.FC<Props> = ({ items }) => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  if (!items.length) return null;

  const nameTemplate = (w: CurrentWeather) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <i className="pi pi-map-marker" />
      <Link to={`/city/${encodeURIComponent(w.name)}`} state={{ label: w.name }}>{w.name}</Link>
    </span>
  );

  const tempSeverity = (t: number) => {
    if (t <= 0) return 'info' as const;
    if (t < 15) return 'secondary' as const;
    if (t < 25) return 'success' as const;
    if (t < 32) return 'warning' as const;
    return 'danger' as const;
  };

  const tempTemplate = (w: CurrentWeather) => {
    const t = Math.round(w.main.temp);
    return (
      <Tag value={`${t}°C`} severity={tempSeverity(t)} icon="pi pi-thermometer" />
    );
  };

  const descTemplate = (w: CurrentWeather) => {
    const text = (w.weather?.[0]?.description ?? '-');
    const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
    const t = Math.round(w.main.temp);
    const fl = Math.round(w.main.feels_like);
    const icon = fl <= 0 ? 'pi pi-snowflake' : t >= 25 ? 'pi pi-sun' : 'pi pi-cloud';
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <i className={icon} />
        {capitalized}
      </span>
    );
  };

  const feelsLikeTemplate = (w: CurrentWeather) => {
    const fl = Math.round(w.main.feels_like);
    return <Tag value={`${fl}°C`} severity="secondary" icon="pi pi-gauge" />;
  };

  const windTemplate = (w: CurrentWeather) => {
    const speed = w.wind?.speed ?? 0;
    const label = `${speed} m/s`;
    const severity = speed < 5 ? 'success' : speed < 10 ? 'warning' : 'danger';
    return <Tag value={label} severity={severity as any} icon="pi pi-compass" />;
  };

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 600 }}>Resultaten</span>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Filter..." />
      </span>
    </div>
  );

  return (
    <div style={{ marginTop: 12 }}>
      <DataTable value={items} dataKey="dt" responsiveLayout="scroll" size="small" paginator rows={5} rowsPerPageOptions={[5,10,20]} stripedRows showGridlines globalFilter={globalFilter} header={header}>
        <Column header="Stad" body={nameTemplate} sortable></Column>
        <Column header="Temp. (°C)" body={tempTemplate} sortable></Column>
        <Column header="Gevoelstemp. (°C)" body={feelsLikeTemplate} sortable></Column>
        <Column header="Weer" body={descTemplate}></Column>
        <Column header="Wind (m/s)" body={windTemplate} sortable></Column>
      </DataTable>
    </div>
  );
};

export default WeatherTable;


