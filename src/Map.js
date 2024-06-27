import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.scss';
import Menu from './Menu';
import Legend from './Legend';
import {paintMarker} from './Marker'
import MapStyleControl from './MapStyleControl'
import {assets} from './Assets';
let _ = require('underscore');

const hashToPlace = () => window.location.hash.split("#")[1];

const Map = ({config}) => {
  mapboxgl.accessToken = config.map.accessToken;
  const {assetPath, loadPlace, fetchPlaces} = assets(config);

  const fetchPlacesRef = useRef(fetchPlaces);
  const map = useRef(null);
  const mapStylesRef = useRef(config.map.mapStyles);
  const hoveredFtRef = useRef(null), selectedFtRef = useRef(null);
  const mapContainerRef = useRef(null);
  const attributionRef = useRef(config.map.attribution);
  const centerRef = useRef(config.map.center);
  const zoomRef = useRef(config.map.zoom);
  const showLocationsRef = useRef(config.map.showLocations);
  const geolocationRef = useRef(config.map.geolocation);
  const circleRadiusRef = useRef(config.map.circleRadius);
  const circleStrokeWidthRef = useRef(config.map.circleStrokeWidth);
  const circleStrokeColorRef = useRef(config.map.circleStrokeColor);
  const colorWaterMarkerRef = useRef(config.map.colorWaterMarker);
  const colorNonWaterMarkerRef = useRef(config.map.colorNonWaterMarker);
  const colorPolyFillRef = useRef(config.map.colorPolyFill);
  const colorRiverRef = useRef(config.map.colorRiver);
  const colorTrackRef = useRef(config.map.colorTrack);
  const paintPolyRef = useRef(config.map.paintPoly);
  const paintTrackRef = useRef(config.map.paintTrack);
  const paintRiversSmRef = useRef(config.map.paintRiversSm);
  const paintRiversLgRef = useRef(config.map.paintRiversLg);
  const legendRef = useRef(config.map.legend);

  const mapData = useRef({});
  
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
          'circle-radius': circleRadiusRef.current,
          'circle-stroke-width': circleStrokeWidthRef.current,
          'circle-stroke-color': circleStrokeColorRef.current,
          'circle-color': (isWaterMarker ? colorWaterMarkerRef.current : colorNonWaterMarkerRef.current)
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
        'paint': paintPolyRef.current,
        'filter': ['==', '$type', 'Polygon']
      });
      const lID1 = `${lID0}-area`;
      map.current.addLayer({
        'id': lID1,
        'type': 'fill',
        'source': lID0,
        'paint': {
          'fill-color': colorPolyFillRef.current,
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
        'paint': (isTrack ? paintTrackRef.current : isSmRiver ? paintRiversSmRef.current : paintRiversLgRef.current),
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
            if (json != null) _.each(json.locations, paintMarker(assetPath, map.current, place, setModalHtml, showLocationsRef.current));
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
      .catch((err) => {
        console.log(err);
        setError("That place does not exist.");
      });
    });
  
  useEffect(() => {
    if (modalHtml != null) {
      const r = 15, s = 2;
      selectedFtRef.current = new mapboxgl.Popup({offset: [0, r*1.25+s/2]})
        .setLngLat(modalHtml.loc)
        .setHTML(`<svg class='tip selected' width='${r*2}' height='${r*2}'><circle fill='${colorTrackRef.current}' fill-opacity='0.25' stroke-width='${s}' stroke='${colorTrackRef.current}' r='${r}' cx='${r}' cy='${r}'></circle></svg>`)
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
        projection: 'globe',
        style: mapStylesRef.current[0].url
      })
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

      if (geolocationRef.current)
        map.current.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
          })
        );
      
      if (mapStylesRef.current.length > 1) map.current.addControl(new MapStyleControl(mapStylesRef.current), 'top-right');

    // Clean up on unmount
    return () => map.current.remove();
  }, []);

  return (
    <div>
      <div id="my-controls">
        <Menu places={places} />
        <Legend available={legendRef.current} visible={legendVisible} colorRiver={colorRiverRef.current} colorTrack={colorTrackRef.current} />
      </div>
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
