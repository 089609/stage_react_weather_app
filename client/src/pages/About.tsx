import React from 'react';

const About: React.FC = () => {
  return (
    <section style={{ padding: '1rem' }}>
      <h1>Over deze app</h1>
      <p>
        Deze React app haalt weergegevens op via de OpenWeatherMap API en toont
        een overzicht en detailpagina per stad. Gemaakt met TypeScript en React Router.
      </p>
    </section>
  );
};

export default About;


