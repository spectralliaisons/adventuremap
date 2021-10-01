import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.scss';
import Menu from './Menu';
import {paintWindow} from './Window'
import {fetchPlaces, loadPlace} from './Api';
let _ = require('underscore');

mapboxgl.accessToken =
  'pk.eyJ1IjoiZWRvYXJkc2Nob29uZXIiLCJhIjoiY2lxcHR0dG51MDJoZGZxbmhneTB0aW5oOSJ9.RX4c1qW-bwPCptphF_mr_A';

const paintPlace = map => place => 
  loadPlace(place, paintData(map, place))
    .then(({json, paint}) => {
      moveTo(map, json);
      if (paint) {
        paintMultimediaMarkers(map, place, json);
      }
    });

const moveTo = (map, {zoom, locations, center}) => {
  const pos = _.findWhere(locations, {"label":center}).loc;
  map.flyTo({center:[pos.lng, pos.lat], zoom: zoom});
};

// paint custom markers for photos & audio 
const paintMultimediaMarkers = (map, place, {locations}) => _.each(locations, paintWindow(map, place));

// paint geojson data
const paintData = (map, place) => layer => data => {
  const lID = `layer-${place}-${layer}`;
  map.addSource(lID, {
    type: 'geojson',
    data: data
  });
  
  const kinds = lID.split("-");
  addPoints(map, lID, kinds);
  addLines(map, lID, kinds);
  addPolys(map, lID);
};

const addPoints = (map, layer, kinds) => {
  const isWaterMarker = kinds.indexOf("cenote") !== -1 || kinds.indexOf("river") !== -1;
  const lID = `${layer}-points`;
  map.addLayer({
    'id': lID,
    'type': 'circle',
    'source': layer,
    'paint': {
    'circle-radius': 6,
    'circle-color': (isWaterMarker ? '#2592ff' : '#ff2592')
    },
    'filter': ['==', '$type', 'Point']
  });

  // add tooltips on hover
  map.on('mousemove', lID, ({ features }) => {
    if (features.length === 0 ) return;
    const ft = features[0];
    const el = document.createElement('div');
    el.textContent = ft.properties.name;
    const popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(ft.geometry.coordinates)
      .setDOMContent(el)
      .addTo(map);
    el.parentNode.parentNode.className += ' tip';
    map.on('closeAllPopups', () => { 
      popup.remove(); 
    });
    map.on('mouseleave', lID, () => {
      map.fire('closeAllPopups');
    });
  });
};

const addLines = (map, layer, kinds) => {
  const isTrack = kinds.indexOf("track") !== -1;
  map.addLayer({
    'id': `${layer}-lines`,
    'type': 'line',
    'source': layer,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': (isTrack ? paintTrack : paintRivers),
    'filter': ['==', '$type', 'LineString']
  });
};

const addPolys = (map, layer) => {
  map.addLayer({
    'id': `${layer}-polygons`,
    'type': 'fill',
    'source': layer,
    'paint': {
      'fill-color': '#000000',
      'fill-opacity': 0.2
    },
    'filter': ['==', '$type', 'Polygon']
  });
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

    // User location
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
      })
    );

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
      <Menu paintPlace={paintPlace(map)} places={places} />
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

export default Map;
