window.templates = {
    "menu" : '<div id="menu"><ul>{{#places}}<a id={{id}} href="#{{id}}">{{disp}}</a>{{/places}}</ul></div>',
    "map-item-content" : '<div id="map-item-content">' +
    '<h2>{{title}}</h2>' +
    '<a href="{{imgLgSrc}}" target="_blank" id="map-item-content-img">' +
        '<img src="{{imgSmSrc}}" id="map-item-content-img"/>' +
    '</a>' +
    '{{#audSrc}}' +
    '<audio controls style="width: 100%"><source src="{{audSrc}}" type="audio/mpeg">Your browser does not support audio. Good job!</audio>' +
    '{{/audSrc}}' +
'</div>'
};

// prevent caching
window.cacheBust = function(url) { return url + "?rev=" + (new Date()).getTime(); };