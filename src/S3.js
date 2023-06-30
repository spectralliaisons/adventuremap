let _ = require('underscore');
let _cache = {};
let _filter_local_places = (p) => window.location.host === "localhost:3000" || !p.local;

const s3 = ({s3}) => {

  const s3rsc = where => `${s3.bucketUrl}/gps/s3/${where}?rev=${(new Date()).getTime()}`;

  const fetchPlaces = () =>
    _fetchJSON("all_rivers")
      .then(({places}) => {
        const dat = _.chain(places)
          .filter(_filter_local_places)
          .sortBy("disp")
          .map((p,i) => _.extend(p, {i}))
          .reduce(((acc, {disp, id, i}) => _.extend(acc, {[id]:{disp, i, loaded:false}})), {})
          .value();
        return Promise.resolve(dat);
      });

  const loadPlace = (place, paintData) => {
    if (place != null && _cache[place] == null) {
      return _fetchJSON(`${place}/info`)
        .then(json => {
            _cache[place] = json;
            _.each(json.layers, layer => 
              fetch(s3rsc(`${place}/geojson/${layer}`))
                .then((res) => res.json())
                .then(paintData(layer)));
            return Promise.resolve({json:json, paint:true});
        })
    }
    else {
      return Promise.resolve({json:_cache[place], paint:place == null});
    }
  };

  const _fetchJSON = which =>
    fetch(s3rsc(`${which}.json`))
      .then(res => {
        if (res.ok) {
          return(res.json());
        }
        else {
          return Promise.reject(`Unable to fetch ${which}.json`);
        }
      });
  
  return {s3rsc, fetchPlaces, loadPlace};
};

export {s3};