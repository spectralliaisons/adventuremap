window.gps = (function(){
    /** PRIVATE **/
    
    function load(place, reposition=true) {

        setErrorVisible(false);
        setLoaderVisible(true);

        // is this place already loaded?
        if (reposition && moveMapToExistingPlace(place)) {
            return;
        }

        return fetch(s3rsc(place + "/info.json"))
            .then(res => {
                if (res.ok) {
                    res.json().then(json => {
                        handleJSON(place, json, reposition);
                        return Promise.resolve();
                    });
                }
                else {
                    setLoaderVisible(false);
                    setErrorVisible(true);
                    return Promise.reject();
                }
            })
            .then(res => {
                // map is ready, permit showing geolocation
            
                $("#show-geoloc").click(function(e){

                    if (navigator.geolocation) {

                        $("#gm-control-button-myloc").addClass("blink");

                        // add marker to usr geolocation
                        navigator.geolocation.getCurrentPosition(setUsrPosition);

                        // update usr pos marker as device location changes
                        navigator.geolocation.watchPosition(updateUsrPosition);
                    }
                });
                
                $("#edit-menu").removeClass("hidden");
            })
    }
    
    function setUsrPosition(position) {
        
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // add marker at user geolocation
        // option to drop pin at this location w/ window telling gps pos

        var currInfoWindow = new google.maps.InfoWindow({
            content: Mustache.render(window.templates["user-created-marker"], {
                "loc": JSON.stringify(pos),
                "gps": Mustache.render(window.templates["gps-loc"], {"id":"usr-geolocation-window", "lat":pos.lat, "lng":pos.lng}),
                "title": "your location"
            })
        });

        var markerSet = createMarker({"loc":pos}, currInfoWindow, window.gmap, 'my_location_blue', undefined, true);
        window.gps.usrloc = markerSet;

        // center map at user geolocation
        window.gmap.setZoom(15);
        window.gmap.setCenter(pos);
        
        $("#gm-control-button-myloc").removeClass("blink");
    }
    
    function updateUsrPosition(position) {
        
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // update marker position
        _.each(window.gps.usrloc.markers, function(marker){marker.setPosition(pos)});

        // update gps position text in the marker window
        $("#usr-geolocation-window").html(Mustache.render(window.templates["gps-loc"], {"id":"usr-geolocation-window", "lat":pos.lat, "lng":pos.lng}));
    }
    
    function loadMultiple(places) {
        
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

    function handleJSON(place, json, reposition) {

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
                
                var i = _.keys(window.gps.tacks).length;
                var deleteID = "delete-marker-" + i;
                
                // option to drop pin at this location w/ window telling gps pos
                var currInfoWindow = new google.maps.InfoWindow({
                    content: Mustache.render(window.templates["user-created-marker"], {
                        "loc": clickedLocStr,
                        "gps": Mustache.render(window.templates["gps-loc"], clickedLoc),
                        "deleteID": deleteID
                    })
                });
                
                function onWindowOpened() {
                    $("#"+deleteID).on("click", function(e){
                        e.preventDefault();
                        window.gps.tacks[deleteID].window.setMap(null);
                        _.each(window.gps.tacks[deleteID].markers, function(marker){marker.setMap(null);});
                    });
                };
                
                var markerSet = createMarker({"loc":clickedLoc}, currInfoWindow, window.gmap, 'edit', onWindowOpened);
                window.gps.tacks[deleteID] = markerSet;
                
                markerSet.onClick();
            });
        }
        else if (reposition) {
            moveMapToExistingPlace(place);
        }

        // add kml layers
        // param to kml url prevents caching by Google
        _.each(json.layers, function(layer) {
            new google.maps.KmlLayer({
                url: s3rsc(place + /kml/ + layer),
                map: window.gmap
            });
        });

        // add interactive marker for each location
        var validLocations = _.filter(json.locations, validLocation);
        _.each(validLocations, function(location) {

            //  only one info window at a time
            var currInfoWindow = new google.maps.InfoWindow({
                content: createWindowHTML(location, place)
            });

            createMarker(location, currInfoWindow, window.gmap);
        });
    }

    function createWindowHTML(location, place) {

        var imgLgSrc = location.img ? s3rsc(place + /img/ + location.img) : "";
        var imgSmSrc = location.img ? s3rsc(place + /imgSm/ + location.img) : "";
        var audSrc = location.aud ? s3rsc(place + /aud/ + location.aud) : "";

        var o = {
            "title": location.label,
            "gps": Mustache.render(window.templates["gps-loc"], location.loc),
            "date": location.date,
            "imgLgSrc": imgLgSrc,
            "imgSmSrc": imgSmSrc,
            "audSrc": audSrc
        };

        return Mustache.render(window.templates["map-item-content"], o);
    }

    function createMarker(location, currInfoWindow, map, labelIcon=undefined, onWindowOpened=undefined, iconOnly=false) {

        var markerOpts = {
            map: map,
            position: new google.maps.LatLng(location.loc.lat, location.loc.lng),
            label: " ",
            zIndex: location.img ? 0 : 1 // make audio markers easier to see
        };
        
        function onClick() {

            if (window.lastInfoWindow) {
                window.lastInfoWindow.close();
            }

            currInfoWindow.open(map, markerLabel);
            
            if (onWindowOpened) {
                _.defer(onWindowOpened);
            }

            window.lastInfoWindow = currInfoWindow;
        };

        // add marker
        if (!iconOnly) {
            var markerPin = new google.maps.Marker(markerOpts);
            markerPin.addListener('click', onClick);
        }
        
        function makeIcon(l) {

            var o = {
                url: "./rsc/ic_" + l + "_24px.svg"
            }
            
            if (!iconOnly) {
                o.anchor = new google.maps.Point(12, 40)
            }
            
            return o;
        };

        // add marker label as svg
        var markerLabel = new google.maps.Marker(_.extend(markerOpts, {
            icon: (labelIcon ? makeIcon(labelIcon) : (location.aud ? makeIcon('volume_up') : makeIcon('camera_alt')))
        }));
        markerLabel.addListener('click', onClick);
        
        // return object so we can keep track of user-created markers
        return {"onClick":onClick, "window":currInfoWindow, "markers":_.compact([markerPin, markerLabel])};
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
        usrloc : null, // user geolocation
        tacks : {}, // user-created gps locations
        load : load,
        loadMultiple : loadMultiple
    };
})();