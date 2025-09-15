import React from 'react';
import { Card } from 'primereact/card';

const About: React.FC = () => {
  return (
    <section style={{ padding: '1rem' }}>
      <Card title="Over deze app">
        <p>
          Deze React app haalt weergegevens op via de OpenWeatherMap API en toont
          een overzicht en detailpagina per stad. Gemaakt met TypeScript en React Router.
        </p>
      </Card>
    </section>
  );
};

export default About;


