import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import Home from './pages/Home';
import About from './pages/About';
import CityDetail from './pages/CityDetail';
import Contact from './pages/Contact';
import './App.css';

function App() {
  const navigate = useNavigate();
  const items = [
    { label: 'Home', icon: 'pi pi-home', command: () => navigate('/') },
    { label: 'About', icon: 'pi pi-info-circle', command: () => navigate('/about') },
    { label: 'Contact', icon: 'pi pi-envelope', command: () => navigate('/contact') },
  ];
  return (
    <div className="App">
      <Menubar model={items} />
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
