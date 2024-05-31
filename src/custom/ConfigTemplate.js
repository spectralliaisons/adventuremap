const config = {
    site: {
        title: "{{your page title}}"
    },
    s3: {
        bucketUrl : "{{url of the S3 bucket for map resources}}"
    },
    map : {
        accessToken : "{{mapbox access token}}",
        mapStyles : [
            {
                "name":"{{display name for this map style}}",
                "url":"{{url of this mapbox style}}"
            }
        ],
        showLocations: true,
        center: [-119.509444, 37.229722],
        zoom: 5,
        attribution : `{{e.g. your copyright here -- this is shown if you hover your cursor over the mapbox info at the bottom right}}`,
        geolocation: true,
        circleRadius: 6,
        circleStrokeWidth: 0,
        circleStrokeColor: '#ffffff',
        colorWaterMarker: '#2592ff',
        colorNonWaterMarker: '#ff2592',
        colorPolyFill: '#ff6c6c',
        colorRiver: '#00bcff',
        colorTrack: '#ff2592',
        paintPoly: { 'line-color': '#ff6c6c', 'line-width': 1, 'line-opacity':0.85 },
        paintTrack: { 'line-color': '#ff2592', 'line-width': 2, 'line-opacity':0.6},
        paintRiversSm: { 'line-color': '#00bcff', 'line-width': 1, 'line-opacity': 0.6},
        paintRiversLg: { 'line-color': '#00bcff', 'line-width': 2, 'line-opacity': 1.0},
        legend: {'aud':true, 'img':true, 'water':true, 'human':true, 'other':true, 'river':true, 'route':true}
    }
}

export {config};