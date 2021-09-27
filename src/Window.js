import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import {s3rsc} from './Api';
import 'material-icons/iconfont/material-icons.css';
import './Window.scss';

const paintWindow = (map, place) => (location) => {
    const el = document.createElement('div');
    ReactDOM.render(<Window place={place} location={location}/>, el);

    new mapboxgl.Marker()
      .setLngLat([location.loc.lng, location.loc.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setDOMContent(el)
      )
      .addTo(map)
    
    el.parentNode.className += ' media';
  }

const Window = ({place, location}) => {
    const srcLg = location.img ? s3rsc(`${place}/imgLg/${location.img}`) : null;
    const srcSm = location.img ? s3rsc(`${place}/imgSm/${location.img}`) : null;
    const label = location.label || "";
    return (
        <div>
          <div className="center">
            <div className="labels">
            <Location location={location}/>
            <Date date={location.date} />
            </div>
            <h3>{label}</h3>
            <Image srcLg={srcLg} srcSm={srcSm} label={label}/>
          </div>
          <Sound place={place} src={location.aud} />
        </div>
    );
};

const Location = ({location}) => {
  const lat = location.loc.lat.toFixed(4);
  const lng = location.loc.lng.toFixed(4);
  const url = `https://www.google.com/maps/search/?api=1&query=${location.loc.lat},${location.loc.lng}`;
  return (
    <div className="icon link"><span className="material-icons">map</span><a href={url} target="_">{lat},{lng}</a></div>
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
  if (srcSm == null || srcLg == null) {
    return <div></div>
  }
  else {
    return (
      <a href={srcLg} target="_blank" rel="noreferrer">
        <img src={srcSm} href={srcLg} alt={label}/>
      </a>
    )
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