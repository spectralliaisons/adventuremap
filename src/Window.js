import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import {s3rsc} from './Api';
import 'material-icons/iconfont/material-icons.css';
import './Window.scss';

const paintWindow = (map, place) => location => {
  const el = document.createElement('div');
  ReactDOM.render(<Window place={place} location={location}/>, el);

  const popup = new mapboxgl.Popup({ 
    className: 'media', 
    closeOnClick: true,
    offset: 25 
  }).setDOMContent(el);

  let marker = document.createElement('div');
  if (location.aud != null) {
    marker.className = 'marker-aud';
  }
  else if (location.img != null) {
    marker.className = 'marker-img';
  }
  else {
    marker.className = 'marker-pt'
  }
  new mapboxgl.Marker(marker)
    .setLngLat([location.loc.lng, location.loc.lat])
    .setPopup(popup)
    .addTo(map);

  popup.on('open', resizePopup);
  window.addEventListener('resize', resizePopup, true);
};

const resizePopup = (el0) => {
  let el1 = el0.target._content || document.getElementsByClassName("mapboxgl-popup-content")[0];
  if (el1 != null) {
    let x = window.innerWidth/2 - el1.clientWidth/2;
    el1.style = `transform:translate(${x}px, 0px)`;
  }
};

const Window = ({place, location}) => {
  const srcLg = location.img ? s3rsc(`${place}/imgLg/${location.img}`) : null;
  const srcSm = location.img ? s3rsc(`${place}/imgSm/${location.img}`) : null;
  const label = location.label || "";

  return (
      <div>
        <div className="labels">
          <Location location={location}/>
          <Date date={location.date} />
        </div>
        <div className="center">
          <h3>{label}</h3>
        </div>
        <Image srcLg={srcLg} srcSm={srcSm} label={label}/>
        <Sound place={place} src={location.aud} />
      </div>
  );
};

const Location = ({location}) => {
  const lat = location.loc.lat.toFixed(4);
  const lng = location.loc.lng.toFixed(4);
  const url = `https://www.google.com/maps/search/?api=1&query=${location.loc.lat},${location.loc.lng}`;
  return (
    <div className="loc">
      <div className="icon link"><span className="material-icons">map</span><a href={url} target="_">{lat},{lng}</a></div>
      <div className="bordr"></div>
    </div>
  )
}

const Date = ({date}) => {
  if (date == null) {
    return <div></div>
  }
  else {
    return (
      <div className="icon"><span className="material-icons">schedule</span>{date}</div>
    )
  }
}

const Image = ({srcLg, srcSm, label}) => {
  return (
    <div className="center">
      <a id="scroll" href={srcLg} target="_blank" rel="noreferrer">
        <ImageContent srcLg={srcLg} srcSm={srcSm} label={label}/>
      </a>
    </div>
  )
}

const ImageContent = ({srcLg, srcSm, label}) => {
  if (srcSm == null || srcLg == null) {
    return (<div></div>)
  }
  else {
    return <img className="bordr" src={srcSm} href={srcLg} alt={label}/>
  }
}

const Sound = ({place, src}) => {
  if (src == null) {
    return <div></div>
  }
  else {
    const url = s3rsc(`${place}/aud/${src}`);
    return (
      <audio controls><source src={url} type="audio/mpeg"/>Your browser does not support audio!</audio>
    )
  }
}

export {paintWindow}