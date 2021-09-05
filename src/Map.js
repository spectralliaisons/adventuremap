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
      console.log(`fetchJSON ${which} res.ok ${res.ok}`);
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
      _.each(json.layers, layer => {
        paintLine(map, paintRiver, place, layer);
      });
    })
    .catch(() => console.log("That didn't work."))

const fetchPlaces = () =>
  fetchJSON("all_rivers")
    .then(({places}) => Promise.resolve(_.sortBy(places, "disp")));

const paintRiver = {'line-color': '#00bcff','line-width': 3};

// paintLine(map, paintRiver, "Russian_River", "russian_river");
const paintLine = (map, paint, location, track) => {
  map.addSource(track, {
    type: 'geojson',
    data: s3rsc(`${location}/geojson/${track}`)
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
