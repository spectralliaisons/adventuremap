// prevent caching
function cacheBust(url){return url + "?rev=" + (new Date()).getTime()};

// TODO: not this? google needs kml to be hosted from publicly-visible location
var origin = "https://s3-us-west-1.amazonaws.com/wesmjackson.com"; //"https://github.com/spectralliaisons/multimap";//; // location.origin

function initTracker(place) {
    
    // is this place already loaded?
    if (moveMapToExistingPlace(place))
        return;
    
    setLoaderVisible(true);
    
    var basePath = origin + "/gps/Places/" + place;
    
    $.ajax({
        url: cacheBust(basePath + "/info.json"),
        dataType: "json",
        success: function(json) {
            try {
                handleJSON(basePath, json);
            }
            catch (err) {
                setErrorVisible(true);
            }
        },
        error: function(){setErrorVisible(true);}
    });
}

function moveMapToExistingPlace(place) {
    
    // load description
    $("#map-description").load("/gps/Places/" + place + "/desc.html");
    
    $( ".map-description-img-container li a" ).unbind("click");
        $( ".map-description-img-container li a" ).click(function( event ) {
            // do anything here?
        });
    
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
    return (location.loc != undefined && location.loc.lat != undefined && location.loc.lng != undefined);
}

function handleJSON(basePath, json) {
    
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
            // hide error
            document.getElementById("error").style.display = "none";
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
            map: gmap
        });
    });

    // add interactive marker for each location
    var validLocations = _.filter(json.locations, validLocation);
    _.each(validLocations, function(location) {
        
        var imgLgSrc = location.img ? cacheBust(basePath + /img/ + location.img) : "";
        var imgSmSrc = location.img ? cacheBust(basePath + /imgSm/ + location.img) : "";
        var audSrc = location.aud ? cacheBust(basePath + /aud/ + location.aud) : "";

        // html contents of marker window
        var contentString = '<div id="map-item-content">'+
        "<h2>" + location.label + "</h2>"+
        "<a href='" + imgLgSrc + "' target='_blank' id='map-item-content-img'><img src='" + imgSmSrc + "' id='map-item-content-img' ></img></a>"+
        (location.aud ? "<audio controls style='width: 100%'><source src='" + audSrc + "' type='audio/mpeg'>Your browser does not support audio. Good job!</audio>" : "")+
        '</p>'+
        '</div>'+
        '</div>';

        //  only one info window at a time
        var currInfoWindow = new google.maps.InfoWindow({
            content: contentString
        });

        // different colors for img only vs img+audio
        var label = location.aud ? 'movie-theater' : 'point-of-interest'
        var color = location.aud ? '#2e0a18' : '#ea2c75'

        var marker = new mapIcons.Marker({
            map: gmap,
            position: new google.maps.LatLng(location.loc.lat, location.loc.lng),
            icon: {
                path: mapIcons.shapes.SQUARE_PIN,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '',
                strokeWeight: 0
            },
            map_icon_label: '<span class="map-icon map-icon-' + label + '"></span>'
        });

        marker.addListener('click', function() {

            if (window.lastInfoWindow) {
                window.lastInfoWindow.close();
            }

            currInfoWindow.open(gmap, marker);

            window.lastInfoWindow = currInfoWindow;
        });
    });
}

function setLoaderVisible(visible) {
    // show loader
    document.getElementById("loader").style.display = visible ? "block" : "none";
    
    // hide hamburger
    document.getElementById("hamburger").style.display = visible ? "none" : "block";
}

// failed to load json for a place
function setErrorVisible(visible) { 
    
    document.getElementById("error").style.display = visible ? "block" : "none";
    
    setLoaderVisible(false);
}