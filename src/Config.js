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
        center: [-119.509444, 37.229722],
        zoom: 5,
        attribution : `© Wes Jackson ${new Date().getFullYear()} ~ Love and water are never wasted; they are the efflux of our inner nature`,
        geolocation: false,
        circleRadius: 12, // 6
        circleStrokeWidth: 2, // 0
        circleStrokeColor: '#ffffff',
        colorWaterMarker: '#4A4672', // 2592ff
        colorNonWaterMarker: '#B04D5B', // ff2592
        colorPolyFill: '#CF664F', // ff6c6c
        colorRiver: '#4A4672', // 00bcff
        colorTrack: '#B04D5B', // ff2592
        paintPoly: { 'line-color': '#CF664F', 'line-width': 1, 'line-opacity':0.85 }, // ff6c6c
        paintTrack: { 'line-color': '#B04D5B', 'line-width': 2, 'line-opacity':0.6}, // ff2592
        paintRiversSm: { 'line-color': '#4A4672', 'line-width': 1, 'line-opacity': 0.6}, // 00bcff
        paintRiversLg: { 'line-color': '#4A4672', 'line-width': 2, 'line-opacity': 1.0} // 00bcff
    }
}

export {config};