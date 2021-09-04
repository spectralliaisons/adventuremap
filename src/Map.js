import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';

mapboxgl.accessToken =
  'pk.eyJ1IjoiZWRvYXJkc2Nob29uZXIiLCJhIjoiY2lxcHR0dG51MDJoZGZxbmhneTB0aW5oOSJ9.RX4c1qW-bwPCptphF_mr_A';

const s3url = (where) => `https://s3-us-west-2.amazonaws.com/multimap/gps/s3/${where}?rev=${(new Date()).getTime()}`;

const paintRiver = {'line-color': '#00bcff','line-width': 3};

const paintLine = (map, paint, location, track) => {
  map.addSource(track, {
    type: 'geojson',
    data: s3url(`${location}/geojson/${track}.geojson`)
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

  const [lng, setLng] = useState(5);
  const [lat, setLat] = useState(34);
  const [zoom, setZoom] = useState(1.5);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    map.on('load', () => paintLine(map, paintRiver, "Russian_River", "russian_river"));

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className='sidebar'>
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
      </div>
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;
