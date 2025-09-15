import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import usePrimeTheme from './theme/usePrimeTheme';
import Home from './pages/Home';
import About from './pages/About';
import CityDetail from './pages/CityDetail';
import Contact from './pages/Contact';
import './App.css';

function App() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = usePrimeTheme();
  const items = [
    { label: 'Home', icon: 'pi pi-home', command: () => navigate('/') },
    { label: 'About', icon: 'pi pi-info-circle', command: () => navigate('/about') }
  ];
  const start = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingInline: 8 }}>
      <i className="pi pi-cloud" style={{ fontSize: 18 }} />
      <span style={{ fontWeight: 700 }}>WeatherApp</span>
    </div>
  );
  const end = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingInline: 8 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <i className={isDark ? 'pi pi-moon' : 'pi pi-sun'} />
        <InputSwitch checked={isDark} onChange={toggleTheme as any} />
      </span>
      <Button label="Contact" icon="pi pi-send" text onClick={() => navigate('/contact')} />
    </div>
  );
  return (
    <div className="App">
      <Menubar model={items} start={start} end={end} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/city/:name" element={<CityDetail />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;
