import React from 'react';
import { Link } from 'react-router-dom';
import type { CurrentWeather } from '../types/weather';

interface Props {
  items: CurrentWeather[];
}

const WeatherTable: React.FC<Props> = ({ items }) => {
  if (!items.length) return null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Stad</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Temperatuur (°C)</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Omschrijving</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Wind (m/s)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((w) => {
            const condition = w.weather?.[0];
            return (
              <tr key={`${w.name}-${w.dt}`}>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <Link to={`/city/${encodeURIComponent(w.name)}`} state={{ label: w.name }}>{w.name}</Link>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{Math.round(w.main.temp)}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{condition?.description ?? '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{w.wind?.speed ?? '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WeatherTable;


