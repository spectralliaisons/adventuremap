import ReactDomServer from 'react-dom/server'
import mapboxgl from 'mapbox-gl';
import 'material-icons/iconfont/material-icons.css';

const paintMarker = (s3rsc, map, place, setModalHtml) => location => {
  const el = document.createElement('div');

  const popup = new mapboxgl.Popup({ 
    className: 'media', 
    closeOnClick: true,
    offset: 25 
  }).setDOMContent(el);

  const loc = [location.loc.lng, location.loc.lat];

  new mapboxgl.Marker(styledMarker(location))
    .setLngLat(loc)
    .setPopup(popup)
    .addTo(map);

  const html = ReactDomServer.renderToString(<Window s3rsc={s3rsc} place={place} location={location}/>);
  popup.on('open', () => setModalHtml({loc, html:html}));
};

const styledMarker = location => {
  let marker = document.createElement('div');
  if (location.aud != null) {marker.className = 'marker-aud';}
  else if (location.img != null) {marker.className = 'marker-img';}
  return marker;
};

const Window = ({s3rsc, place, location}) => {
  const label = location.label || "";
  const srcLg = location.img ? s3rsc(`${place}/imgLg/${location.img}`) : null;
  const srcSm = location.img ? s3rsc(`${place}/imgSm/${location.img}`) : null;
  const date = location.date ? location.date.split(" ")[0].replaceAll(":", ".") : null;
  return (
      <div>
        <Location location={location}/>
        <h3>{label}</h3>
        <Image srcLg={srcLg} srcSm={srcSm} label={label} date={date} />
        <Sound s3rsc={s3rsc} place={place} src={location.aud} />
      </div>
  );
};

const Location = ({location}) => {
  const lat = location.loc.lat.toFixed(4);
  const lng = location.loc.lng.toFixed(4);
  const url = `https://www.google.com/maps/search/?api=1&query=${location.loc.lat},${location.loc.lng}`;
  return <div className="icon"><span className="material-icons">map</span><a href={url} target="_">{lat},{lng}</a></div>
};

const Image = ({srcLg, srcSm, label, date}) => {
  return (
    <a href={srcLg} target="_blank" rel="noreferrer">
      <ImageContent srcLg={srcLg} srcSm={srcSm} label={label} date={date} />
    </a>
  )
};

const ImageContent = ({srcLg, srcSm, label, date}) => {
  if (srcSm == null || srcLg == null) {
    return (<div></div>)
  }
  else {
    const formatted = date;
    return (
      <div>
        <img src={srcSm} href={srcLg} alt={label} />
        <div id="date">{formatted}</div>
      </div>
    )
  }
};

const Sound = ({s3rsc, place, src}) => {
  if (src == null) {
    return <div></div>
  }
  else {
    const url = s3rsc(`${place}/aud/${src}`);
    return (
      <audio controls><source src={url} type="audio/mpeg"/>Your browser does not support audio!</audio>
    )
  }
};

export {paintMarker};