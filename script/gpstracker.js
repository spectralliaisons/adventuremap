// prevent caching
function cacheBust(url) { return url + "?rev=" + (new Date()).getTime(); }

// TODO: not this? google needs kml to be hosted from publicly-visible location
var origin = "https://s3-us-west-1.amazonaws.com/wesmjackson.com"; //"https://github.com/spectralliaisons/multimap";//; // location.origin

window.gps = {
    load : function(place) {
        console.log("gps.load() :: " + place);
        
        setErrorVisible(false);
        setLoaderVisible(true);
    
        // is this place already loaded?
        if (moveMapToExistingPlace(place)) {
            console.log("already loaded. bailing!");
            return;
        }

        var basePath = origin + "/gps/Places/" + place;

        fetch(cacheBust(basePath + "/info.json"))
            .then(res => {
                if (res.ok) {
                    res.json().then(json => handleJSON(basePath, json));
                }
                else {
                    setLoaderVisible(false);
                    setErrorVisible(true);
                }
        })
    }
};

function moveMapToExistingPlace(place) {
    
    var json = window.maps[place];
    if (json) {
        
        window.gmap.setZoom(json.zoom);
        window.gmap.setCenter(_.findWhere(json.locations, {"label":json.center}).loc);
        window.gmap.setMapTypeId(json.mapType);
        
        return true;
    }
    return false;
}

function validLocation(location) {
    var valid = (location.loc != undefined && location.loc.lat != undefined && location.loc.lng != undefined);
    if (!valid) {
        console.log("INVALID LOCATION: " + JSON.stringify(location));
    }
    return valid;
}

function handleJSON(basePath, json) {
    
    console.log("handleJSON");
    
    // TODO: use promise or something to prevent multiple loading of places
    window.maps[place] = json;
            
    // we may not know where to center the map
    var c = _.findWhere(json.locations, {"label":json.center});
    if (c) {
        var cen = c.loc
    }

    // setup map type
    if (!window.gmap) {

        window.gmap = new google.maps.Map(document.getElementById('map'), {
            zoom: json.zoom,
            center: cen,
            mapTypeId: json.mapType,
            mapTypeControlOptions : {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                mapTypeIds: ['terrain', 'hybrid', 'satellite', 'roadmap']
            },
            fullscreenControl:true
        });

        google.maps.event.addListener(window.gmap, 'idle', function(){
            // do something only the first time the map is loaded
            setLoaderVisible(false);
        });
    }
    else {
        moveMapToExistingPlace(place);
    }

    // add kml layers
    // param to kml url prevents caching by Google
    _.each(json.layers, function(layer) {
        trackLayer = new google.maps.KmlLayer({
            url: cacheBust(basePath + /kml/ + layer),
            map: window.gmap
        });
    });
    
    // add interactive marker for each location
    var validLocations = _.filter(json.locations, validLocation);
    _.each(validLocations, function(location) {

        //  only one info window at a time
        var currInfoWindow = new google.maps.InfoWindow({
            content: createWindowHTML(location, basePath)
        });
        
        createMarker(location, currInfoWindow, window.gmap);
    });
}

function createWindowHTML(location, basePath) {
    
    var imgLgSrc = location.img ? cacheBust(basePath + /img/ + location.img) : "";
    var imgSmSrc = location.img ? cacheBust(basePath + /imgSm/ + location.img) : "";
    var audSrc = location.aud ? cacheBust(basePath + /aud/ + location.aud) : "";
    
    var o = {
        "title": location.label,
        "imgLgSrc": imgLgSrc,
        "imgSmSrc": imgSmSrc,
        "audSrc": audSrc
    };
    
    return Mustache.render(window.templates["map-item-content"], o);
}

function createMarker(location, currInfoWindow, map) {
    
    var markerOpts = {
        map: map,
        position: new google.maps.LatLng(location.loc.lat, location.loc.lng),
//            animation: google.maps.Animation.DROP,
        title: location.aud ? 'photo + audio' : 'photo',
        zIndex: location.aud ? 1 : 0, // make audio markers easier to see
        label: location.aud ? " " : " "
    }
    
    function onClick(marker) {
        
        if (window.lastInfoWindow) {
            window.lastInfoWindow.close();
        }

        currInfoWindow.open(gmap, marker);

        window.lastInfoWindow = currInfoWindow;
    }
    
    // add marker
    var markerPin = new google.maps.Marker(markerOpts);
    markerPin.addListener('click', function(){onClick(markerPin)});
    
    // add marker label as svg
    var markerLabel = new google.maps.Marker(_.extend(markerOpts, {
        icon: location.aud ? audioLabel() : photoLabel()
    }));
    markerLabel.addListener('click', function(){onClick(markerLabel)});
}

function audioLabel() {
    
    return {
        anchor: new google.maps.Point(12, 40),
        url: "./rsc/ic_volume_up_24px.svg"
    }
}

function photoLabel() {
    
    return {
        anchor: new google.maps.Point(12, 40),
        url: "./rsc/ic_camera_alt_24px.svg"
    }
}

function setLoaderVisible(visible) {
    
    if (visible) {
        $("#loader").removeClass("hidden");
        $("#hamburger").addClass("hidden");
    }
    else {
        $("#loader").addClass("hidden");
        $("#hamburger").removeClass("hidden");
    }
}

// failed to load json for a place
function setErrorVisible(visible) { 
    
    if (visible) {
        $("#error").removeClass("hidden");      
    }
    else {
        $("#error").addClass("hidden");
    }
}