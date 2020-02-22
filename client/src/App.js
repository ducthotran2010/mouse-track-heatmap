import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    console.log('hihi');
    window.onload = function() {
      var anchors = document.getElementsByTagName('a');
      for (var i = 0; i < anchors.length; i++) {
        anchors[i].onclick = function() {
          return false;
        };
      }
    };
  }, []);
  return <div className="App">aaaaaaaaaaaaaaaaaaaaaaaaaaaa</div>;
}

export default App;
