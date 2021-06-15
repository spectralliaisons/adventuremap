console.log("love and water are never wasted; they are the efflux of our inner nature");

window.templates = {
    "menu" : '<div id="menu">' +
    '{{#places}}' +
    '<a id={{id}} href="#{{id}}">{{disp}}</a>' +
    '{{/places}}' +
    '</div>',
    "map-item-content" : '<div id="map-item-content">{{{gps}}}' +
    '{{#date}}' +
    '<div class="gps-info-icon-txt"><i class="material-icons date-icon">schedule</i><div class="gps-info-txt">{{date}}</div></div>' +
    '{{/date}}' +
    '{{#title}}<h3>{{title}}</h3>{{/title}}' +
    '{{#imgSmSrc}}' + 
    '<a href="{{imgLgSrc}}" target="_blank" id="map-item-content-img">' +
        '<img src="{{imgSmSrc}}" id="map-item-content-img"/>' +
    '</a>' +
    '{{/imgSmSrc}}' +
    '{{#audSrc}}' +
    '<audio controls style="width: 100%"><source src="{{audSrc}}" type="audio/mpeg">Your browser does not support audio. Good job!</audio>' +
    '{{/audSrc}}' +
'</div>',
    "user-created-marker" : '<div id="map-item-content">{{{gps}}}' +
    '{{#title}}<h3>{{title}}</h3>{{/title}}' +
    '{{#deleteID}}' +
    '<div class="left"><a href="" id="{{deleteID}}"><i class="material-icons left clickable" id="{{deleteID}}">delete</i></a></div>' +
    '{{/deleteID}}' +
    '</div>',
    "gps-loc" : '<div id="{{id}}" class="gps-info-icon-txt bottom-border"><a href="https://www.google.com/maps/search/?api=1&query={{lat}},{{lng}}" target="_"><i class="material-icons left clickable">map</i></a><div class="gps-info-txt"><a href="https://www.google.com/maps/search/?api=1&query={{lat}},{{lng}}" target="_">{{lat}},{{lng}}</a></div></div>'
};

// prevent caching
window.s3rsc = url => {
    // TODO: not this? google needs kml to be hosted from publicly-visible location
    const basePath = "https://s3-us-west-2.amazonaws.com/multimap/gps/s3/";
    return basePath + url + "?rev=" + (new Date()).getTime();
};