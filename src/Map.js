import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.scss';
import Menu from './Menu';
import Legend from './Legend';
import {paintWindow} from './Window'
import {s3} from './S3';
import Nav from './Navigation';
let _ = require('underscore');

const colorWaterMarker = '#2592ff';
const colorNonWaterMarker = '#ff2592';
const colorPoly = '#ff0000';
const colorRiver = '#00bcff';
const colorTrack = '#ff2592';

let tip = null;

const moveTo = (map, {zoom, locations, center}) => {
  const pos = _.findWhere(locations, {"label":center}).loc;
  map.flyTo({center:[pos.lng, pos.lat], zoom: zoom});
};

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
  const coord = ft.geometry.type === "Polygon" ? lngLat.wrap() : ft.geometry.coordinates;
  
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
      'fill-opacity': 0.1
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

const Map = ({config}) => {
  const {s3rsc, loadPlace, fetchPlaces} = s3(config);
  mapboxgl.accessToken = config.map.accessToken;

  const mapContainerRef = useRef(null);

  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [legendVisible, setLegendVisible] = useState(false);
  const [error, setError] = useState(null);

  const paintPlace = (m, success, fail) => place => 
    loadPlace(place, paintData(m, place))
      .then(({json, paint}) => {
        moveTo(m, json);
        if (paint) {
          paintMultimediaMarkers(m, place, json);
          success(place);
        }
      })
      .catch((err) => fail("That place does not exist."));
  
  // paint custom markers for photos & audio 
  const paintMultimediaMarkers = (m, place, {locations}) => _.each(locations, paintWindow(s3rsc, m, place));
  
  const doPaintPlace = (m) => paintPlace(m, (place) => {
    setError(null);
    setLegendVisible(true);
    Nav.setHash(place);
  }, setError);

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: config.map.mapStyle,
        attributionControl: false,
        center: config.map.center,
        zoom: config.map.zoom
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
      .addControl(new mapboxgl.AttributionControl({compact: true,customAttribution: config.map.attribution}))
      .addControl(new mapboxgl.FullscreenControl({container: document.querySelector('body')}))
      .addControl(new mapboxgl.NavigationControl(), 'top-right')
      .once('load', () => fetchPlaces().then((res) => {
        if (res == null) setError("Could not fetch places.")
        else {
          setPlaces(res);
          setMap(map);
          Nav.connect({
            paintPlace:doPaintPlace(map),
            setError:setError
          });
        }
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
      <Error message={error} />
      <div className='map-container' ref={mapContainerRef} />
    </div>
  );
};

const Error = ({message}) => {
  if (message != null) {
    return (
      <div id="center-message">
        <div id="message-container">
          <div id="message">{message}</div>
        </div>
      </div>
    )
  }
  else {
    return <div></div>
  }
}

export default Map;
