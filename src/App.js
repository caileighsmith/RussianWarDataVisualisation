import React from 'react';
import './App.css';
import WarLossesMap from './components/WarLossesMap';
import WarStatsCard from './components/WarStatsCard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Russian Damage Statistics Dashboard</h1>
      </header>
      <WarLossesMap />
      <WarStatsCard />
    </div>
  );
}

export default App;