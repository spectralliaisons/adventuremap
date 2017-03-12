function initTracker(place){
    
//    if (place == "RussianRiver") {
//        $("#"+place).load("notyet.html");
//        return;
//    }
    
    // TODO: not this? google needs kml to be hosted from publicly-visible location
    var origin = "https://s3-us-west-1.amazonaws.com/wesmjackson.com";//"https://github.com/spectralliaisons/multimap";//; // location.origin
    
    var basePath = origin + "/gps/Places/" + place
    
    function cacheBuster(){return "?rev=" + (new Date()).getTime()};
    
    $.getJSON(basePath + "/info.json" + cacheBuster(), function(json){

        var cen = _.findWhere(json.locations, {"label":json.center}).loc
        
        // setup map type
//        if (!window.gmap) {
//            window.gmap = new google.maps.Map(document.getElementById('map'), {
//                zoom: json.zoom,
//                center: cen,
//                mapTypeId: json.mapType,
//                mapTypeControlOptions : {
//                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
//                    mapTypeIds: ['terrain', 'hybrid']
//                },
//                fullscreenControl:true
//            });
//        }
//        else {
//            gmap.setZoom(json.zoom);
//            gmap.setCenter(cen);
//            gmap.setMapTypeId(json.mapType);
//        }
        var gmap = new google.maps.Map(document.getElementById("map-" + place), {
                zoom: json.zoom,
                center: cen,
                mapTypeId: json.mapType,
                mapTypeControlOptions : {
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                    mapTypeIds: ['terrain', 'hybrid']
                },
                fullscreenControl:true
            });
        
        // add kml layers
        // param to kml url prevents caching by Google
        _.each(json.layers, function(layer) {
            trackLayer = new google.maps.KmlLayer({
                url: basePath + /kml/ + layer + cacheBuster(),
                map: gmap
            });
        });
        
        // add interactive marker for each location
        _.each(json.locations, function(location){
            
            var imgLgSrc = basePath + /img/ + location.img + cacheBuster();
            var imgSmSrc = basePath + /imgSm/ + location.img + cacheBuster();
            var audSrc = basePath + /aud/ + location.aud + cacheBuster();
            
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

            var marker = new google.maps.Marker({
                position: location.loc,
                map: gmap
            });

            marker.addListener('click', function() {
                
                if (window.lastInfoWindow) {
                    window.lastInfoWindow.close();
                }
                
                currInfoWindow.open(gmap, marker);
                
                window.lastInfoWindow = currInfoWindow;
            });
        });
    });
}