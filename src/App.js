import React from 'react';
import Map from './Map';
import {config} from './custom/private/Config';

function App() {
  return (
    <div>
      <title>{config.site.title}</title>
      <Map config={config}/>
    </div>
  );
}

export default App;
