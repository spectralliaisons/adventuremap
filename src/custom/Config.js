const config = {
    site: {
        title: "Rivers of CA"
    },
    assets: {
        location : "https://d3w53aju7jg0.cloudfront.net"
    },
    map : {
        accessToken : "pk.eyJ1IjoiZWRvYXJkc2Nob29uZXIiLCJhIjoiY2x4MXY0OTRjMGJrNzJqb2FrNGd2cmQ0eSJ9.Sz_JwTjEDFAHVumFuaRNfA",
        mapStyles : [
            {
                "name":"Light",
                "url":"mapbox://styles/edoardschooner/cku8yh0id5za818rmtnwt7zzo"
            },
            {
                "name":"Terrain",
                "url":"mapbox://styles/edoardschooner/cjjyezpmd7pn02rlhom56eiwl"
            },
            {
                "name":"Parks", 
                "url":"mapbox://styles/edoardschooner/ciqptutzk0046bgm1urgdvwiu"
            },
            {
                "name":"Satellite",
                "url":"mapbox://styles/mapbox/satellite-v9"
            },
            {
                "name":"Lavendar",
                "url":"mapbox://styles/edoardschooner/clwr7skwh00xr01pp5luy4z3l"
            }
        ],
        center: [-119.509444, 37.229722],
        zoom: 5,
        attribution : `© Wes Jackson ${new Date().getFullYear()} ~ Love and water are never wasted; they are the efflux of our inner nature`,
        showLocations: false, // true
        geolocation: false,
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
        legend: ['aud', 'img', 'water', 'human', 'other', 'river', 'route']
    }
}

export {config};