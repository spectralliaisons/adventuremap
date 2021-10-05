import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.scss';
import Menu from './Menu';
import Legend from './Legend';
import {paintWindow} from './Window'
import {fetchPlaces, loadPlace} from './Api';
import Nav from './Navigation'
import { gt } from 'lodash';
let _ = require('underscore');

mapboxgl.accessToken = "pk.eyJ1IjoiZWRvYXJkc2Nob29uZXIiLCJhIjoiY2lxcHR0dG51MDJoZGZxbmhneTB0aW5oOSJ9.RX4c1qW-bwPCptphF_mr_A";

const mapStyle = "mapbox://styles/edoardschooner/cku8yh0id5za818rmtnwt7zzo";
const attribution = "© Wes Jackson 2021 ~ Love and water are never wasted; they are the efflux of our inner nature";

const colorWaterMarker = '#2592ff';
const colorNonWaterMarker = '#ff2592';
const colorPoly = '#000000';
const colorRiver = '#00bcff';
const colorTrack = '#ff2592';

let tip = null;

const paintPlace = (map, success, fail) => place => 
  loadPlace(place, paintData(map, place))
    .then(({json, paint}) => {
      moveTo(map, json);
      if (paint) {
        paintMultimediaMarkers(map, place, json);
        success(place);
      }
    })
    .catch((err) => fail(true))

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
  
  const kinds = layer.replace(".geojson", "").split("-");
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
    'circle-color': (isWaterMarker ? colorWaterMarker : colorNonWaterMarker)
    },
    'filter': ['==', '$type', 'Point']
  });
  map.on('mousemove', lID, drawTooltip(map, lID));
  map.on('click', lID, drawTooltip(map, lID));
  map.on('mouseleave', lID, () => map.fire('closeAllPopups'));
};

// add tooltips on hover
const drawTooltip = (map, lID) => ({ lngLat, features }) => {
  if (features.length === 0 ) return;

  if (tip != null) {
    tip.remove();
    tip = null;
  }
  const ft = features[0];
  const coord = ft.geometry.type == "Polygon" ? lngLat.wrap() : ft.geometry.coordinates;
  
  const el = document.createElement('div');
  el.textContent = ft.properties.name;

  tip = new mapboxgl.Popup({offset: [0, -15]})
    .setLngLat(coord)
    .setDOMContent(el)
    .addTo(map);

  el.parentNode.parentNode.className += ' tip';

  map.on('closeAllPopups', () => { 
    if (tip != null) {
      tip.remove();
    }
    tip = null;
  });
};

const addLines = (map, layer, kinds) => {
  const isTrack = kinds.indexOf("track") !== -1;
  const isSmRiver = kinds.indexOf("sm") !== -1;
  map.addLayer({
    'id': `${layer}-lines`,
    'type': 'line',
    'source': layer,
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': (isTrack ? paintTrack : paintRivers(isSmRiver)),
    'filter': ['==', '$type', 'LineString']
  });
};

const addPolys = (map, layer) => {
  map.addLayer({
    'id':  `${layer}-outline`,
    'type': 'line',
    'source': layer,
    'paint': paintPoly,
    'filter': ['==', '$type', 'Polygon']
  });
  const lID = `${layer}-area`;
  map.addLayer({
    'id': lID,
    'type': 'fill',
    'source': layer,
    'paint': {
      'fill-color': colorPoly,
      'fill-opacity': 0.0
    },
    'filter': ['==', '$type', 'Polygon']
  });
  map.on('mousemove', lID, drawTooltip(map));
  map.on('click', lID, drawTooltip(map));
  map.on('mouseleave', lID, () => map.fire('closeAllPopups'));
};

const paintRivers = sm => ({ 'line-color': colorRiver, 'line-width': (sm ? 1 : 2), 'line-opacity': (sm ? 0.6 : 1.0)} );
const paintTrack = { 'line-color': colorTrack, 'line-width': 2, 'line-opacity':0.6} ;
const paintPoly = { 'line-color': colorPoly, 'line-width': 2, 'line-opacity':0.25 };

const Map = () => {
  const mapContainerRef = useRef(null);

  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [legendVisible, setLegendVisible] = useState(false);
  const [error, setError] = useState(false);

  const doPaintPlace = (m) => paintPlace(m, (place) => {
    setError(false);
    setLegendVisible(true);
    Nav.setHash(place);
  }, () => setError(true));

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        attributionControl: false,
        center: [-123.0561972, 38.9144944],
        zoom: 5
      })
      .addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
        })
      )
      .addControl(new mapboxgl.AttributionControl({compact: true,customAttribution: attribution}))
      .addControl(new mapboxgl.FullscreenControl({container: document.querySelector('body')}))
      .addControl(new mapboxgl.NavigationControl(), 'top-right')
      .once('load', () => fetchPlaces().then((res) => {
        setPlaces(res);
        setMap(map);
        Nav.connect({
          paintPlace:doPaintPlace(map),
          setError:setError
        });
      }));

    // Clean up on unmount
    return () => map.remove();
  }, []); 

  return (
    <div>
      <div id="my-controls">
        <Menu paintPlace={doPaintPlace(map)} places={places} />
        <Legend visible={legendVisible} colorRiver={colorRiver} colorTrack={colorTrack}/>
      </div>
      <Error visible={error} />
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

const Error = ({visible}) => {
  if (visible) {
    return (
      <div id="center-message">
        <div id="message-container">
          <div id="message">that place does not exist</div>
        </div>
      </div>
    )
  }
  else {
    return <div></div>
  }
}

export default Map;
