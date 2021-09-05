let _ = require('underscore');

const s3rsc = where => `https://s3-us-west-2.amazonaws.com/multimap-2/gps/s3/${where}?rev=${(new Date()).getTime()}`;

const fetchJSON = which =>
  fetch(s3rsc(`${which}.json`))
    .then(res => {
      if (res.ok) {
        return(res.json());
      }
      else {
        return Promise.reject(`Unable to fetch ${which}.json`);
      }
    })

const loadPlace = (place, paintData) => 
  fetchJSON(`${place}/info`)
    .then(json => {
        _.each(json.layers, loadLayer(place, paintData))
        return Promise.resolve(json);
    });

const fetchPlaces = () =>
  fetchJSON("all_rivers")
    .then(({places}) => Promise.resolve(_.sortBy(places, "disp")));

const loadLayer = (place, paintData) => layer => 
  fetch(s3rsc(`${place}/geojson/${layer}`))
    .then((res) => res.json())
    .then(paintData(layer))

export {fetchPlaces, loadPlace}