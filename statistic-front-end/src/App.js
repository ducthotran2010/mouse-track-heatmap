import axios from 'axios';
import * as heatmap from 'heatmap.js';
import React, { useEffect } from 'react';

const STATISTIC_END_POINT = 'http://localhost:7777/statistic';

const initHeatMap = async () => {
  const respone = await axios.get(STATISTIC_END_POINT, {
    params: { hostname: 'localhost' },
  });

  console.log(respone.data);

  const {
    offsetWidth: newWidth,
    offsetHeight: newHeight,
  } = document.querySelector('#img');

  const { width, height } = respone.data;
  const data = respone.data.coordinates.map(({ x, y }) => ({
    x: Math.floor((x / width) * newWidth),
    y: Math.floor((y / height) * newHeight),
    value: 100,
  }));

  console.log(data);

  const instance = heatmap.create({
    container: document.getElementById('heatmap'),
    radius: 10,
    maxOpacity: 0.5,
    minOpacity: 0,
    blur: 0.75,
  });

  instance.setData({
    max: 10,
    data,
  });
};

function App() {
  useEffect(() => {
    initHeatMap();
  }, []);

  return (
    <div className="App" id="heatmap">
      <img
        id="img"
        width="1200"
        alt="good"
        src="http://localhost:7777/dom-img"
      ></img>
    </div>
  );
}

export default App;
