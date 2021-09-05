import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import Menu from './Menu';

let _ = require('underscore');

mapboxgl.accessToken =
  'pk.eyJ1IjoiZWRvYXJkc2Nob29uZXIiLCJhIjoiY2lxcHR0dG51MDJoZGZxbmhneTB0aW5oOSJ9.RX4c1qW-bwPCptphF_mr_A';

const s3rsc = (where) => `https://s3-us-west-2.amazonaws.com/multimap-2/gps/s3/${where}?rev=${(new Date()).getTime()}`;

const fetchJSON = (which) =>
  fetch(s3rsc(`${which}.json`))
    .then(res => {
      if (res.ok) {
        return(res.json());
      }
      else {
        return Promise.reject(`Unable to fetch ${which}.json`);
      }
    })

const loadPlace = map => place => 
  fetchJSON(`${place}/info`)
    .then(json => {
      Promise.all(_.map(json.layers, layer => loadLayer(map, place, layer)))
        .catch(alert)
    })

const fetchPlaces = () =>
  fetchJSON("all_rivers")
    .then(({places}) => Promise.resolve(_.sortBy(places, "disp")));

const loadLayer = (map, place, layer) => 
  fetch(s3rsc(`${place}/geojson/${layer}`))
    .then((res) => res.json())
    .then(paintData(map, place, layer))

const paintData = (map, place, layer) => (data) => {
  map.addSource(layer, {
    type: 'geojson',
    data: data
  });
  window.themap = map;
  // https://docs.mapbox.com/mapbox-gl-js/example/multiple-geometries/
  const kinds = layer.split("-");
  console.log(`paintData place ${place} layer ${layer} kinds ${JSON.stringify(kinds)}`);
  const isTrack = kinds.indexOf("track") != -1;
  const isWaterMarker = kinds.indexOf("cenote") != -1;

  map.addLayer({
    'id': `${place}-${layer}-lines`,
    'type': 'line',
    'source': layer,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': (isTrack ? paintTrack : paintRivers),
    'filter': ['==', '$type', 'LineString']
  });

  map.addLayer({
    'id': `${place}-${layer}-points`,
    'type': 'circle',
    'source': layer,
    'paint': {
    'circle-radius': 6,
    'circle-color': (isWaterMarker ? '#0000FF' : '#FF0000')
    },
    'filter': ['==', '$type', 'Point']
  });

  map.addLayer({
    'id': `${place}-${layer}-polygons`,
    'type': 'fill',
    'source': layer,
    'paint': {
      'fill-color': '#000000',
      'fill-opacity': 0.2
    },
    'filter': ['==', '$type', 'Polygon']
  });

  // TODO: custom icon / hover / click marker: https://docs.mapbox.com/mapbox-gl-js/example/custom-marker-icons/
};

const paintRivers = {'line-color': '#00bcff','line-width': 2};
const paintTrack = {'line-color': '#000000','line-width': 2,'line-opacity':0.6};

const Map = () => {
  const mapContainerRef = useRef(null);

  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-123.0561972, 38.9144944],
      zoom: 5
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.once('load', () => fetchPlaces().then((res) => {
      setPlaces(res);
      setMap(map);
    }));

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='sidebar'>
        <Menu loadPlace={loadPlace(map)} places={places} />
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;
