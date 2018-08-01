window.gps = (function(){
    /** PRIVATE **/

    // TODO: not this? google needs kml to be hosted from publicly-visible location
    var origin = "https://s3-us-west-1.amazonaws.com/wesmjackson.com"; //"https://github.com/spectralliaisons/multimap";//; // location.origin
    
    function load(place, reposition=true) {
        console.log("gps.load() :: " + place);

        setErrorVisible(false);
        setLoaderVisible(true);

        // is this place already loaded?
        if (reposition && moveMapToExistingPlace(place)) {
            console.log("already loaded. bailing!");
            return;
        }

        var basePath = origin + "/gps/Places/" + place;

        return fetch(cacheBust(basePath + "/info.json"))
            .then(res => {
                if (res.ok) {
                    res.json().then(json => {
                        handleJSON(basePath, json, reposition)
                        return Promise.resolve();
                    });
                }
                else {
                    setLoaderVisible(false);
                    setErrorVisible(true);
                    return Promise.reject();
                }
        })
    }
    
    function loadMultiple(places) {
        console.log("gps.loadMultiple() :: " + places.length);
        
        if (places.length) {
            
            var first = places.shift();
            
            return load(first, false).then(res => {return loadMultiple(places)});
        }
        else {
            
            // zoom way out
            window.gmap.setZoom(7); // fit all CA rivers on screen
            window.gmap.setCenter({"lat":-119.442998228, "lng":37.159666028}); // North Fork, CA
            window.gmap.setMapTypeId("hybrid");
            
            return Promise.resolve();
        }
    }
    
    function notLoaded(place) {
        
        return window.maps[place] == undefined;
    }

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

    function handleJSON(basePath, json, reposition) {

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

            // event when google map has finished loading
            google.maps.event.addListener(window.gmap, 'idle', function(){
                setLoaderVisible(false);
            });
            
            // event when you click map. show gps coords of where you clicked.
            google.maps.event.addListener(window.gmap, 'click', function(event) {
                var clickedLoc = {"lat":event.latLng.lat(), "lng":event.latLng.lng()};
                var clickedLocStr = JSON.stringify(clickedLoc);
                console.log("google map clicked at " + clickedLocStr);
                
                var i = _.keys(window.gps.tacks).length;
                var id = "delete-marker-" + i;
                
                // option to drop pin at this location w/ window telling gps pos
                var currInfoWindow = new google.maps.InfoWindow({
                    content: Mustache.render(window.templates["user-created-marker"], {
                        "loc": clickedLocStr,
                        "gps": Mustache.render(window.templates["gps-loc"], clickedLoc),
                        "id": id
                    })
                });
                
                function onWindowOpened() {
                    console.log("onWindowOpened() for #" + id);
                    console.log($("#"+id));
                    $("#"+id).click(function(e){
                        console.log("CLICKED id: " + id);
                        e.preventDefault();
                        window.gps.tacks[id].window.setMap(null);
                        _.each(window.gps.tacks[id].markers, function(marker){marker.setMap(null);});
                    });
                };
                
                var markerSet = createMarker({"loc":clickedLoc}, currInfoWindow, window.gmap, 'my_location', onWindowOpened);
                window.gps.tacks[id] = markerSet;
                
                markerSet.onClick();
            });
        }
        else if (reposition) {
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
            "gps": Mustache.render(window.templates["gps-loc"], location.loc),
            "imgLgSrc": imgLgSrc,
            "imgSmSrc": imgSmSrc,
            "audSrc": audSrc
        };

        return Mustache.render(window.templates["map-item-content"], o);
    }

    function createMarker(location, currInfoWindow, map, labelIcon=undefined, onWindowOpened=undefined) {

        var markerOpts = {
            map: map,
            position: new google.maps.LatLng(location.loc.lat, location.loc.lng),
            label: " ",
            title: location.aud ? 'photo + audio' : (location.img ? 'photo' : JSON.stringify(location.loc)),
            zIndex: location.img ? 0 : 1 // make audio markers easier to see
        }

        // add marker
        var markerPin = new google.maps.Marker(markerOpts);
        markerPin.addListener('click', onClick);

        // add marker label as svg
        var markerLabel = new google.maps.Marker(_.extend(markerOpts, {
            icon: (labelIcon ? makeIcon(labelIcon) : (location.aud ? makeIcon('volume_up') : makeIcon('camera_alt')))
        }));
        markerLabel.addListener('click', onClick);
        
        function makeIcon(l) {

            return {
                anchor: new google.maps.Point(12, 40),
                url: "./rsc/ic_" + l + "_24px.svg"
            }
        }
        
        function onClick() {

            if (window.lastInfoWindow) {
                window.lastInfoWindow.close();
            }

            currInfoWindow.open(map, markerPin);
            
            if (onWindowOpened) {
                onWindowOpened();
            }

            window.lastInfoWindow = currInfoWindow;
        }
        
        // return object so we can keep track of user-created markers
        return {"onClick":onClick, "window":currInfoWindow, "markers":[markerPin, markerLabel]};
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
    
    /** PUBLIC **/
    
    return {
        tacks : {}, // user-created gps locations
        load : load,
        loadMultiple : loadMultiple
    };
})();