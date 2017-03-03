function initTracker(place){
    
    // TODO: not this? google needs kml to be hosted from publicly-visible location
    var origin = "https://s3-us-west-1.amazonaws.com/wesmjackson.com"; // location.origin
    
    var basePath = origin+"/gps/Places/"+place
    
    $.getJSON(basePath+"/info.json", function(json){

        // setup map type
        var map = new google.maps.Map(document.getElementById('map-'+place), {
            zoom: json.zoom,
            center: _.findWhere(json.locations, {"label":json.center}).loc,
            mapTypeId: json.mapType,
            mapTypeControlOptions : {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                mapTypeIds: ['terrain', 'hybrid']
            },
            fullscreenControl:true
        });
        
        // add kml layers
        _.each(json.layers, function(layer) {
            window.trackLayer = new google.maps.KmlLayer({
                url: basePath+"/kml/"+layer,
                map:map
            });
        });
        
        // add interactive marker for each location
        _.each(json.locations, function(location){
            
            // html contents of marker window
            var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            "<h2>"+location.label+"</h2>"+
            "<img src='"+basePath+"/img/"+location.img+"' height='400px'></img>"+
            (location.aud ? "<audio controls style='width: 100%'><source src='"+basePath+/aud/+location.aud+"' type='audio/mpeg'>Your browser does not support audio. Good job!</audio>" : "")+
            '</p>'+
            '</div>'+
            '</div>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            var marker = new google.maps.Marker({
                position: location.loc,
                map: map
            });

            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
        });
    });
}