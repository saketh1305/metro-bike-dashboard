import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import MapPage from './pages/MapPage';
import DeckMapPage from './pages/DeckMapPage';
import DashboardPage from './pages/DashboardPage';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/deck-map" element={<DeckMapPage />} /> {/* New Route */}
        <Route path="/Dashboard" element={<DashboardPage />} /> {/* New Route */} 
      </Routes>
    </Router>
  );
}

export default App;
