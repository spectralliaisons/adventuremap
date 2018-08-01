window.templates = {
    "menu" : '<div id="menu">{{#places}}<a id={{id}} href="#{{id}}">{{disp}}</a>{{/places}}</div>',
    "map-item-content" : '<div id="map-item-content">{{{gps}}}' +
    '<h2>{{title}}</h2>' +
    '{{#imgSmSrc}}' + 
    '<a href="{{imgLgSrc}}" target="_blank" id="map-item-content-img">' +
        '<img src="{{imgSmSrc}}" id="map-item-content-img"/>' +
    '</a>' +
    '{{/imgSmSrc}}' +
    '{{#audSrc}}' +
    '<audio controls style="width: 100%"><source src="{{audSrc}}" type="audio/mpeg">Your browser does not support audio. Good job!</audio>' +
    '{{/audSrc}}' +
'</div>',
    "user-created-marker" : '<div>{{{gps}}}' +
    '<div class="left"><a href="" id="{{id}}"><i class="material-icons left clickable" id="{{id}}">delete_forever</i></a></div>' +
    '</div>',
    "gps-loc" : '<div id="gps"><a href="https://www.google.com/maps/search/?api=1&query={{lat}},{{lng}}" target="_"><i class="material-icons left clickable">my_location</i></a><div class="gps-text"><a href="https://www.google.com/maps/search/?api=1&query={{lat}},{{lng}}" target="_">{{lat}},{{lng}}</a></div></div>'
};

// prevent caching
window.cacheBust = function(url) { return url + "?rev=" + (new Date()).getTime(); };