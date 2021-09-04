import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import Menu from './Menu';

let _ = require('underscore');

mapboxgl.accessToken =
  'pk.eyJ1IjoiZWRvYXJkc2Nob29uZXIiLCJhIjoiY2lxcHR0dG51MDJoZGZxbmhneTB0aW5oOSJ9.RX4c1qW-bwPCptphF_mr_A';

const s3rsc = (where) => `https://s3-us-west-2.amazonaws.com/multimap/gps/s3/${where}?rev=${(new Date()).getTime()}`;

const loadPlace = (place) => 
  fetch(s3rsc(place + "/info.json"))
    .then(res => {
      if (res.ok) {
        return new Promise(r1 => {
            res.json().then(json => {
              _.each(json.layers, layer => {
                const url = s3rsc(`${place}/kml/${layer}`);
              });
            });
          });
        }
      });

const fetchPlaces = (map) =>
  fetch(s3rsc("all_rivers.json"))
    .then(res => res.json())
    .then(({places}) => Promise.resolve(_.sortBy(places, "disp")));

const paintRiver = {'line-color': '#00bcff','line-width': 3};

// paintLine(map, paintRiver, "Russian_River", "russian_river");
const paintLine = (map, paint, location, track) => {
  map.addSource(track, {
    type: 'geojson',
    data: s3rsc(`${location}/geojson/${track}.geojson`)
  });
    
  map.addLayer({
    'id': `${track}-layer`,
    'type': 'line',
    'source': track,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': paint
  });
};

const Map = () => {
  const mapContainerRef = useRef(null);

  const [places, setPlaces] = useState([]);

  console.log(["Map places", places]);

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

    map.once('load', () => fetchPlaces(map).then((res) => {
      setPlaces(res);
    }));

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='sidebar'>
        <Menu loadPlace={loadPlace} places={places} />
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;
