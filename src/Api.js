let _ = require('underscore');

const s3rsc = (config, where) => `${config.s3.bucketUrl}/gps/s3/${where}?rev=${(new Date()).getTime()}`;

let _cache = {};

const fetchPlaces = (config) =>
  _fetchJSON(config, "all_rivers")
    .then(({places}) => Promise.resolve(_.sortBy(places, "disp")));

const loadPlace = (config, place, paintData) => {
  if (_cache[place] == null) {
    return _fetchJSON(config, `${place}/info`)
      .then(json => {
          _cache[place] = json;
          _.each(json.layers, _loadLayer(config, place, paintData));
          return Promise.resolve({json:json, paint:true});
      })
  }
  else {
    return Promise.resolve({json:_cache[place], paint:false});
  }
};

const _fetchJSON = (config, which) =>
  fetch(s3rsc(config, `${which}.json`))
    .then(res => {
      if (res.ok) {
        return(res.json());
      }
      else {
        return Promise.reject(`Unable to fetch ${which}.json`);
      }
    });

const _loadLayer = (config, place, paintData) => layer => 
  fetch(s3rsc(config, `${place}/geojson/${layer}`))
    .then((res) => res.json())
    .then(paintData(layer))

export {s3rsc, fetchPlaces, loadPlace}