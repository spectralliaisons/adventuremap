const config = {
    site: {
        title: "Rivers of CA"
    },
    s3: {
        bucketUrl : "https://s3-us-west-2.amazonaws.com/multimap-2"
    },
    map : {
        accessToken : "pk.eyJ1IjoiZWRvYXJkc2Nob29uZXIiLCJhIjoiY2lxcHR0dG51MDJoZGZxbmhneTB0aW5oOSJ9.RX4c1qW-bwPCptphF_mr_A",
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
            }
        ],
        center: [-119.509444, 37.229722],
        zoom: 5,
        attribution : `© Wes Jackson ${new Date().getFullYear()} ~ Love and water are never wasted; they are the efflux of our inner nature`
    }
}

export {config};