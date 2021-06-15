window.gps = (() => {
    
    // introducing some delays to give elements time to load in case we're loading many things
    const delayLoad = 250;
    
    /** PRIVATE **/
    
    const isLoaded = place => window.gps.state.maps[place] != undefined;
    
    const load = (place, reposition=true) => {
        
        setErrorVisible(false);
        setLoaderVisible(true);
        
        return new Promise(resolve => {

            const showError = () => {
                setLoaderVisible(false);
                setErrorVisible(true);
                return Promise.reject();
            }
            
           _.delay(() => {
               
                // If we've already loaded this place, just center it on the map
                if (reposition && isLoaded(place)) {
                    moveMapToExistingPlace(place).then(resolve);
                }
                else {
                    // Load new place info and create map elements
                    fetch(s3rsc(place + "/info.json"))
                        .then(res => {
                            if (res.ok) {
                                return new Promise(r1 => {
                                   res.json().then(json => {
                                       handleJSON(place, json, reposition).then(r1);
                                    }); 
                                });
                            }
                            else {
                                showError();
                            }
                        })
                        .then(res => {
                            // map is ready, permit showing geolocation

                            $("#show-geoloc").click(() => {

                                if (navigator.geolocation) {

                                    $("#gm-control-button-myloc").addClass("blink");

                                    // add marker to usr geolocation
                                    navigator.geolocation.getCurrentPosition(setUsrPosition);

                                    // update usr pos marker as device location changes
                                    navigator.geolocation.watchPosition(updateUsrPosition);
                                }
                            });

                            $("#edit-menu").removeClass("hidden");

                            // maybe we have more places to load once this has finished
                            resolve();
                        })
                        .catch(err => {
                            console.log(["Error loading: " + place, err])
                            showError();
                        })
                }
            }, delayLoad); 
        });
    }
    
    const setUsrPosition = position => {
        
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // add marker at user geolocation
        // option to drop pin at this location w/ window telling gps pos

        const currInfoWindow = new google.maps.InfoWindow({
            content: Mustache.render(window.templates["user-created-marker"], {
                "loc": JSON.stringify(pos),
                "gps": Mustache.render(window.templates["gps-loc"], {"id":"usr-geolocation-window", "lat":pos.lat, "lng":pos.lng}),
                "title": "your location"
            })
        });

        const markerSet = createMarker({"loc":pos}, currInfoWindow, window.gps.state.gmap, 'my_location_blue', undefined, true);
        window.gps.state.usrloc = markerSet;

        // center map at user geolocation
        window.gps.state.gmap.setZoom(15);
        window.gps.state.gmap.setCenter(pos);
        
        $("#gm-control-button-myloc").removeClass("blink");
    }
    
    const updateUsrPosition = position => {
        
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // update marker position
        _.each(window.gps.state.usrloc.markers, marker => {marker.setPosition(pos)});

        // update gps position text in the marker window
        $("#usr-geolocation-window").html(Mustache.render(window.templates["gps-loc"], {"id":"usr-geolocation-window", "lat":pos.lat, "lng":pos.lng}));
    }
    
    const loadMultiple = places => {
        
        if (places.length) {
            
            const first = places.shift();
            
            return load(first, false).then(() => {
                _.delay(loadMultiple, 5000, places);
            });
        }
        else {
            
            // zoom way out
            window.gps.state.gmap.setZoom(7); // fit all CA rivers on screen
            window.gps.state.gmap.setCenter({"lat":-119.442998228, "lng":37.159666028}); // North Fork, CA
            window.gps.state.gmap.setMapTypeId("hybrid");
            
            setLoaderVisible(false);
            
            return Promise.resolve();
        }
    }
    
    const moveMapToExistingPlace = place => 
        
        new Promise(resolve => {
            
            const hideLoaderOnResolution = () => {
                setLoaderVisible(false);
                resolve();
            }
            
            const json = window.gps.state.maps[place];
            if (json) {
                
                const z = json.zoom;
                const ctr = _.findWhere(json.locations, {"label":json.center}).loc;

                window.gps.state.gmap.setZoom(z);
                window.gps.state.gmap.setCenter(ctr);
                window.gps.state.gmap.setMapTypeId(json.mapType);
                
                _.delay(hideLoaderOnResolution, delayLoad);
            }
            else {
                hideLoaderOnResolution();
            }
        });

    const validLocation = location => {
        const valid = (location.loc != undefined && location.loc.lat != undefined && location.loc.lng != undefined);
        if (!valid) {
            console.log("INVALID LOCATION: " + JSON.stringify(location));
        }
        return valid;
    }

    const handleJSON = (place, json, reposition) => {
        
        // TODO: use promise or something to prevent multiple loading of places
        window.gps.state.maps[place] = json;

        // we may not know where to center the map
        const c = _.findWhere(json.locations, {"label":json.center});
        let cen;
        if (c) {
            cen = c.loc
        }
        
        return new Promise(resolve => {
            
            // setup map type
            if (!window.gps.state.gmap) {

                window.gps.state.gmap = new google.maps.Map(document.getElementById('map'), {
                    zoom: json.zoom,
                    center: cen,
                    mapTypeId: json.mapType,
                    mapTypeControlOptions : {
                        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                        mapTypeIds: ['terrain', 'hybrid', 'satellite', 'roadmap']
                    },
                    fullscreenControl:true
                });

                // event when you click map. show gps coords of where you clicked.
                google.maps.event.addListener(window.gps.state.gmap, 'click', event => {

                    const clickedLoc = {"lat":event.latLng.lat(), "lng":event.latLng.lng()};
                    const clickedLocStr = JSON.stringify(clickedLoc);

                    const i = _.keys(window.gps.state.tacks).length;
                    const deleteID = "delete-marker-" + i;

                    // option to drop pin at this location w/ window telling gps pos
                    const currInfoWindow = new google.maps.InfoWindow({
                        content: Mustache.render(window.templates["user-created-marker"], {
                            "loc": clickedLocStr,
                            "gps": Mustache.render(window.templates["gps-loc"], clickedLoc),
                            "deleteID": deleteID
                        })
                    });

                    const onWindowOpened = () => {
                        $("#"+deleteID).on("click", e => {
                            e.preventDefault();
                            window.gps.state.tacks[deleteID].window.setMap(null);
                            _.each(window.gps.state.tacks[deleteID].markers, marker => {marker.setMap(null);});
                        });
                    };

                    const markerSet = createMarker({"loc":clickedLoc}, currInfoWindow, window.gps.state.gmap, 'edit', onWindowOpened);
                    window.gps.state.tacks[deleteID] = markerSet;

                    markerSet.onClick();
                });
            }

            // add kml layers
            // param to kml url prevents caching by Google
            _.each(json.layers, layer => {
                new google.maps.KmlLayer({
                    url: s3rsc(place + /kml/ + layer),
                    map: window.gps.state.gmap
                });
            });

            // add interactive marker for each location
            const validLocations = _.filter(json.locations, validLocation);
            _.each(validLocations, location => {

                //  only one info window at a time
                const currInfoWindow = new google.maps.InfoWindow({
                    content: createWindowHTML(location, place)
                });

                createMarker(location, currInfoWindow, window.gps.state.gmap);
            });
            
            // when google map has finished loading, resolve the current promise
            const listener = google.maps.event.addListener(window.gps.state.gmap, 'idle', () => {
                
                google.maps.event.removeListener(listener);
                
                _.delay(() => {
                    if (reposition) {
                        moveMapToExistingPlace(place).then(resolve);
                    }
                    else {
                        resolve();
                    }
                }, 1000);
            });
        });
    }

    const createWindowHTML = (location, place) => {

        const imgLgSrc = location.img ? s3rsc(place + /imgLg/ + location.img) : "";
        const imgSmSrc = location.img ? s3rsc(place + /imgSm/ + location.img) : "";
        const audSrc = location.aud ? s3rsc(place + /aud/ + location.aud) : "";

        const o = {
            "title": location.label,
            "gps": Mustache.render(window.templates["gps-loc"], location.loc),
            "date": location.date,
            "imgLgSrc": imgLgSrc,
            "imgSmSrc": imgSmSrc,
            "audSrc": audSrc
        };

        return Mustache.render(window.templates["map-item-content"], o);
    }

    const createMarker = (location, currInfoWindow, map, labelIcon=undefined, onWindowOpened=undefined, iconOnly=false) => {

        const markerOpts = {
            map: map,
            position: new google.maps.LatLng(location.loc.lat, location.loc.lng),
            label: " ",
            zIndex: location.img ? 0 : 1 // make audio markers easier to see
        };
        
        const onClick = () => {

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
        let markerPin;
        if (!iconOnly) {
            markerPin = new google.maps.Marker(markerOpts);
            markerPin.addListener('click', onClick);
        }
        
        const makeIcon = l => {

            const o = {
                url: "./rsc/ic_" + l + "_24px.svg"
            }
            
            if (!iconOnly) {
                o.anchor = new google.maps.Point(12, 40)
            }
            
            return o;
        };

        // add marker label as svg
        const markerLabel = new google.maps.Marker(_.extend(markerOpts, {
            icon: (labelIcon ? makeIcon(labelIcon) : (location.aud ? makeIcon('volume_up') : makeIcon('camera_alt')))
        }));
        markerLabel.addListener('click', onClick);
        
        // return object so we can keep track of user-created markers
        return {"onClick":onClick, "window":currInfoWindow, "markers":_.compact([markerPin, markerLabel])};
    }

    const setLoaderVisible = visible => {
        
        if (visible) {
            $("#hamburger").addClass("loading");
            $("#map-container").addClass("inactive");
        }
        else {
            $("#hamburger").removeClass("loading");
            $("#map-container").removeClass("inactive");
        }
    }

    // failed to load json for a place
    const setErrorVisible = visible => { 

        if (visible) {
            $("#error").removeClass("hidden");      
        }
        else {
            $("#error").addClass("hidden");
        }
    }
    
    // have to load everything from scratch (this is only called when using ?clear=true url param)
    const clear = () => {
        window.gps.state = newState();
    }
    
    // an initialized state ensures we have to load everything from scratch
    const newState = () => ({
        "usrloc": null, // user geolocation
        "tacks" : {}, // user-created gps locations,
        "maps": {}, // list of maps we've already loaded (so we don't load and parse their info json again)
        "gmap" : null // the Google Map upon which all map layers are drawn
    })
    
    /** PUBLIC **/
    
    return {
        state : newState(),
        load : load,
        loadMultiple : loadMultiple,
        clear : clear
    };
})();