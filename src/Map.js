import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.scss';
import Menu from './Menu';
import Legend from './Legend';
import {paintMarker} from './Marker'
import StyleSelector from './StyleSelector'
import {s3} from './S3';
let _ = require('underscore');

const colorWaterMarker = '#2592ff';
const colorNonWaterMarker = '#ff2592';
const colorPolyFill = '#ff6c6c';
const colorPolyStroke = '#ff6c6c'
const colorRiver = '#00bcff';
const colorTrack = colorNonWaterMarker;

const paintPoly = { 'line-color': colorPolyStroke, 'line-width': 1, 'line-opacity':0.85 };
const paintTrack = { 'line-color': colorTrack, 'line-width': 2, 'line-opacity':0.6} ;
const paintRivers = sm => ({ 'line-color': colorRiver, 'line-width': (sm ? 1 : 2), 'line-opacity': (sm ? 0.6 : 1.0)} );

const hashToPlace = () => window.location.hash.split("#")[1];

const Map = ({config}) => {
  mapboxgl.accessToken = config.map.accessToken;
  const {s3rsc, loadPlace, fetchPlaces} = s3(config);

  const fetchPlacesRef = useRef(fetchPlaces);
  const map = useRef(null);
  const mapStyles = useRef(config.map.mapStyles);
  const hoveredFtRef = useRef(null), selectedFtRef = useRef(null);
  const mapContainerRef = useRef(null);
  const attributionRef = useRef(config.map.attribution);
  const centerRef = useRef(config.map.center);
  const zoomRef = useRef(config.map.zoom);
  const mapData = useRef({});
  
  const [style, setStyle] = useState(mapStyles.current[0].url);
  const [places, setPlaces] = useState(null);
  const [legendVisible, setLegendVisible] = useState(false);
  const [error, setError] = useState(null);
  const [modalHtml, setModalHtml] = useState(null);
  const [desc, setDesc] = useState(null);
  
  const paintPlaceRef = useRef((place, initialPlaces) => {
    const paintData = place => lID0 => data => {
      if (place == null) return;
      mapData.current[lID0] = () => {
        const lID1 = `layer-${place}-${lID0}`;
        map.current.addSource(lID1, {
          type: 'geojson',
          data: data
        });
      
        const kinds = lID0.replace(".geojson", "").split("-");
        addPoints(lID1, kinds);
        addPolys(lID1);
        addLines(lID1, kinds);
      }
      mapData.current[lID0]();

      // Reload this data if map style changes
      map.current.on('style.load', mapData.current[lID0]);
    };
    
    const addPoints = (lID0, kinds) => {
      const isWaterMarker = kinds.indexOf("cenote") !== -1 || kinds.indexOf("river") !== -1;
      const lID1 = `${lID0}-points`;
      map.current.addLayer({
        'id': lID1,
        'type': 'circle',
        'source': lID0,
        'paint': {
        'circle-radius': 6,
        'circle-color': (isWaterMarker ? colorWaterMarker : colorNonWaterMarker)
        },
        'filter': ['==', '$type', 'Point']
      });
      addListeners(lID1);
    };
    
    const addListeners = lID => {
      map.current.on('mousemove', lID, drawTooltip);
      map.current.on('click', lID, drawDescription);
      map.current.on('mouseleave', lID, () => map.current.fire('closeAllPopups'));
    };
    
    const drawDescription = ({lngLat, features}) => {
      setModalHtml(null);
      if (features.length === 0 || features[0].layer.type === "line" ) return;
      let content = features[0].properties.description;
      if (content !== undefined && content.length > 0) {
        if (features.length === 0 ) return;
        const ft = features[0];
        const loc = ft.geometry.type === "Point" ? ft.geometry.coordinates : lngLat.wrap();
        if (content.indexOf('http') === 0) content = `<a href='${content}' target='_blank'>${content}</a>`;
        setModalHtml({loc, html:content});
      }
      else {
        drawTooltip({lngLat, features});
      }
    };
    
    const drawTooltip = ({lngLat, features}) => {
      if (features.length === 0 ) return;
    
      if (hoveredFtRef.current != null) {
        hoveredFtRef.current.remove();
      }
      const ft = features[0], name = ft.properties["name"] || ft.properties["Name"];
      if (name == null || name.length === 0) return;
      const coord = ft.geometry.type === "Point" ? ft.geometry.coordinates : lngLat.wrap();
      
      const el = document.createElement('div');
      el.textContent = name;
    
      hoveredFtRef.current = new mapboxgl.Popup({offset: [0, -15]})
        .setLngLat(coord)
        .setDOMContent(el)
        .addTo(map.current);
    
      el.parentNode.parentNode.className += ' tip hovered';
    
      map.current.on('closeAllPopups', () => { 
        if (hoveredFtRef.current != null) {
          hoveredFtRef.current.remove();
        }
      });
    };
    
    const addPolys = lID0 => {
      map.current.addLayer({
        'id':  `${lID0}-outline`,
        'type': 'line',
        'source': lID0,
        'paint': paintPoly,
        'filter': ['==', '$type', 'Polygon']
      });
      const lID1 = `${lID0}-area`;
      map.current.addLayer({
        'id': lID1,
        'type': 'fill',
        'source': lID0,
        'paint': {
          'fill-color': colorPolyFill,
          'fill-opacity': 0.1
        },
        'filter': ['==', '$type', 'Polygon']
      });
      addListeners(lID1);
    };
    
    const addLines = (lID0, kinds) => {
      const isTrack = kinds.indexOf("track") !== -1;
      const isSmRiver = kinds.indexOf("sm") !== -1;
      const lID1 = `${lID0}-lines`;
      map.current.addLayer({
        'id': lID1,
        'type': 'line',
        'source': lID0,
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': (isTrack ? paintTrack : paintRivers(isSmRiver)),
        'filter': ['==', '$type', 'LineString']
      });
      addListeners(lID1);
    };

    return loadPlace(place, paintData(place))
      .then(({json, paint}) => {
        if (paint) {
          // first time setting places, hash indicates no place in particular
          if (place == null && initialPlaces != null)
            setPlaces(initialPlaces);
          else {
            // hash indicates a specific place, may be first load or not
            setPlaces(prev0 => {
              const prev1 = prev0 || initialPlaces;
              return ({...prev1, [place]:({...prev1[place], loaded:true})})
            });
            if (json != null) _.each(json.locations, paintMarker(s3rsc, map.current, place, setModalHtml));
          }
        }
        if (json == null)
          setDesc(null);
        else {
          const pos = _.findWhere(json.locations, {"label":json.center}).loc;
          map.current.flyTo({center:[pos.lng, pos.lat], zoom: json.zoom});
          setDesc(json.desc);
        }
        setError(null);
        setLegendVisible(true);
      })
      .catch(() => setError("That place does not exist."))
    });
  
  useEffect(() => {
    if (modalHtml != null) {
      const r = 15, s = 2;
      selectedFtRef.current = new mapboxgl.Popup({offset: [0, r*1.25+s/2]})
        .setLngLat(modalHtml.loc)
        .setHTML(`<svg class='tip selected' width='${r*2}' height='${r*2}'><circle fill='${colorTrack}' fill-opacity='0.25' stroke-width='${s}' stroke='${colorTrack}' r='${r}' cx='${r}' cy='${r}'></circle></svg>`)
        .addTo(map.current);
    }
    else if (selectedFtRef.current != null) {
      selectedFtRef.current.remove();
    }
  }, [modalHtml]);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: centerRef.current,
        zoom: zoomRef.current,
        attributionControl: false,
        projection: 'globe'
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
      .addControl(new mapboxgl.AttributionControl({compact: true, customAttribution: attributionRef.current}))
      .addControl(new mapboxgl.FullscreenControl({container: document.querySelector('body')}))
      .addControl(new mapboxgl.NavigationControl(), 'top-right')
      .once('load', () => {
        fetchPlacesRef.current().then((res) => {
          if (res == null) setError("Could not fetch places.")
          else {
            const doLoad = initialPlaces => {
              let curr = hashToPlace();
              paintPlaceRef.current(curr, initialPlaces);
            }
            doLoad(res);
            window.onhashchange = () => doLoad();
          }
        });
      });

    // Clean up on unmount
    return () => map.current.remove();
  }, []);

  useEffect(() => map.current.setStyle(style), [style]);

  return (
    <div>
      <div id="my-controls">
        <Menu places={places} />
        <Legend visible={legendVisible} colorRiver={colorRiver} colorTrack={colorTrack} />
      </div>
      <StyleSelector options={mapStyles.current} style={style} setStyle={setStyle} />
      <Error message={error} />
      <Desc html={desc} />
      <div className='map-container' ref={mapContainerRef} />
      <Modal html={modalHtml} close={()=>setModalHtml(null)} />
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
};

const Desc = ({html}) => {
  if (html != null) {
    return (
      <div id="desc-container">
        <div id="desc" dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
    )
  }
  else {
    return <div></div>
  }
};

const Modal = ({html, close}) => {
  if (html != null) {
    return (
      <div id="modal-container">
        <div id="scroller">
          <div id="modal">
            <span className="material-icons close" onClick={close}>close</span>
            <div id="content" dangerouslySetInnerHTML={{ __html: html.html }}></div>
          </div>
        </div>
      </div>
    )
  }
  else {
    return <div></div>
  }
};

export default Map;
