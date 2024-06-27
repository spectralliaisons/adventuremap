import ReactDomServer from 'react-dom/server'
import mapboxgl from 'mapbox-gl';
import 'material-icons/iconfont/material-icons.css';

const paintMarker = (assetPath, map, place, setModalHtml, showLocations) => location => {
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

  const html = ReactDomServer.renderToString(<Window assetPath={assetPath} place={place} location={location} showLocations={showLocations}/>);
  popup.on('open', () => setModalHtml({loc, html:html}));
};

const styledMarker = location => {
  let marker = document.createElement('div');
  if (location.link != null) {
    marker.className = 'material-icons marker-link';
    marker.textContent = location.link.icon;
  }
  else if (location.aud != null) {marker.className = 'marker-aud';}
  else if (location.img != null) {marker.className = 'marker-img';}
  return marker;
};

const Window = ({assetPath, place, location, showLocations}) => {
  const label = location.label || "";
  const linkImgSrc = location.link ? location.link.src : null;
  const linkDestination = location.link ? location.link.destination : null;
  const linkText = location.link ? location.link.text : null;
  const imgDestination = location.img ? assetPath(`${place}/imgLg/${location.img}`) : null;
  const imgSrc = location.img ? assetPath(`${place}/imgSm/${location.img}`) : linkImgSrc;
  const date = location.date ? location.date.split(" ")[0].replaceAll(":", ".") : null;
  return (
      <div>
        <Location visible={showLocations} location={location}/>
        <h3>{label}</h3>
        <div className="center">
          <div>
            <Image destination={imgDestination} imgSrc={imgSrc} label={label} date={date}/>
            <ExternalLink destination={linkDestination} text={linkText}/>
          </div>
        </div>
        <Sound assetPath={assetPath} place={place} src={location.aud}/>
        <ExternalVideo src={location.video}/>
      </div>
  );
};

const Location = ({location, visible}) => {
  if (!visible) return <div></div>
  else {
    const lat = location.loc.lat.toFixed(4);
    const lng = location.loc.lng.toFixed(4);
    const url = `https://www.google.com/maps/search/?api=1&query=${location.loc.lat},${location.loc.lng}`;
    return <div className="icon"><span className="material-icons">map</span><a href={url} target="_">{lat},{lng}</a></div>
  }
};

const Image = ({destination, imgSrc, label, date}) => {
  return (
    <a href={destination} target="_blank" rel="noreferrer">
      <ImageContent destination={destination} imgSrc={imgSrc} label={label} date={date} />
    </a>
  )
};

const ImageContent = ({destination, imgSrc, label, date}) => {
  if (imgSrc == null) {
    return (<div></div>)
  }
  else {
    const formatted = date;
    return (
      <div>
        <img src={imgSrc} href={destination} alt={label} />
        <div id="date">{formatted}</div>
      </div>
    )
  }
};

const Sound = ({assetPath, place, src}) => {
  if (src == null) {
    return <div></div>
  }
  else {
    const url = assetPath(`${place}/aud/${src}`);
    return (
      <audio controls><source src={url} type="audio/mpeg"/>Your browser does not support audio!</audio>
    )
  }
};

const ExternalLink = ({destination, text}) => {
  if (destination == null || text == null) {
    return <div></div>
  }
  else return (
    <a className="link" href={destination} target="_blank" rel="noreferrer">{text}</a>
  )
};

const ExternalVideo = ({src}) => {
  if (src == null) {
    return <div></div>
  }
  else {
    const url = `https://www.youtube.com/embed/${src}`;
    return (
      <iframe width="400" height="225" src={url} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
    )
  }
};

export {paintMarker};