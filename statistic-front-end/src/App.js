import axios from 'axios';
import * as heatmap from 'heatmap.js';
import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

const STATISTIC_END_POINT = 'http://localhost:7777/statistic';

const initHeatMap = async () => {
  const respone = await axios.get(STATISTIC_END_POINT, {
    params: { hostname: 'localhost' }
  });

  console.log(respone);
  const data = respone.data.map(row => ({ x: row.x, y: row.y, value: 100 }));

  const instance = heatmap.create({
    container: document.getElementById('heatmapContainer'),
    radius: 10,
    maxOpacity: 0.5,
    minOpacity: 0,
    blur: 0.75
  });

  instance.setData({
    max: 5,
    data
  });
};

function App() {
  useEffect(() => {
    initHeatMap();
  }, []);

  return (
    <div className="App" id="heatmapContainer">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
