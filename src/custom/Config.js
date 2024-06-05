const config = {
    site: {
        title: "Mel Mitchell-Jackson Adventures"
    },
    s3: {
        bucketUrl : "https://d19ukusntnkj32.cloudfront.net"
    },
    map : {
        accessToken : "pk.eyJ1IjoiZWRvYXJkc2Nob29uZXIiLCJhIjoiY2lxcHR0dG51MDJoZGZxbmhneTB0aW5oOSJ9.RX4c1qW-bwPCptphF_mr_A",
        mapStyles : [
            {
                "name":"Persistent Bloom",
                "url":"mapbox://styles/edoardschooner/clwr7skwh00xr01pp5luy4z3l"
            }
        ],
        showLocations: false,
        center: [-119.509444, 37.229722],
        zoom: 5,
        attribution : `© Wes Jackson ${new Date().getFullYear()} ~ Love and water are never wasted; they are the efflux of our inner nature`,
        geolocation: false,
        circleRadius: 12,
        circleStrokeWidth: 2,
        circleStrokeColor: '#ffffff',
        colorWaterMarker: '#4A4672',
        colorNonWaterMarker: '#B04D5B',
        colorPolyFill: '#CF664F',
        colorRiver: '#4A4672',
        colorTrack: '#B04D5B',
        paintPoly: { 'line-color': '#CF664F', 'line-width': 1, 'line-opacity':0.85 },
        paintTrack: { 'line-color': '#B04D5B', 'line-width': 2, 'line-opacity':0.6},
        paintRiversSm: { 'line-color': '#4A4672', 'line-width': 1, 'line-opacity': 0.6},
        paintRiversLg: { 'line-color': '#4A4672', 'line-width': 2, 'line-opacity': 1.0},
        legend: {'aud':false, 'img':true, 'water':true, 'human':false, 'other':false, 'river':true, 'route':true}
    }
}

export {config};