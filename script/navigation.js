window.nav = (function(){
    // set up UI event listeners when document ready
    $( document ).ready(function() {

        // menu is initially retracted
        $("#menu").hide();
        
        // tapping hamburger button slides menu down
        $("#hamburger").click(function(){
            $(this).toggleClass("open");
            $("#menu").slideToggle( "slow", function() {});
        });
    });   

    // enable back, fwd button history
    window.onpopstate = function(e) {
        if (e.state) {
            to('#' + e.state.id);
        }
    };

    // handle change of address (url hash)
    window.onhashchange = function() {
        to(window.location.hash)
    }
    
    // https://davidwalsh.name/query-string-javascript
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.href);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
    
    // call this function when you want to load a place
    function to(fullHref) {
        
        // ignore url params
        var href = fullHref.split("?")[0];
        
        // url param to force place loading
        if (getUrlParameter("clear") == "true") {
            window.gps.clear();
        }

        // remove hash for the place name
        var place = href.replace("#", "");

        // set the page title
        document.title = document.title.split(' | ')[0] + ' | ' + place;

        // show all nav pages as inactive
        _.each(this.nav.places.places, function(p){$("#" + p.id).removeClass('active')});
        // show the loading page nav tab as active
        $(href).addClass('active');
        
        function doLoad(p) {
            
            // load the gmap with this place data
            if (p == "All") {
                // load all not loaded places
                var unloadedPlaces = _.filter(_.pluck(window.nav.places.places, "id"), function(p1){return(p1 != "All" && window.gps.state.maps[p1] == undefined)});
                window.gps.loadMultiple(unloadedPlaces);
            }
            else {
                window.gps.load(p);
            }
        }

        // close menu
        if ($("#hamburger").hasClass("open")) {
            $("#hamburger").click();
            
            // wait for #hamburger animation to finish before doing all the taxing loading
            _.delay(doLoad, 600, place);
        }
        else {
            doLoad(place);
        }
    }
    
    // google maps api is ready
    function ready() {
        
        // wait until google maps api is ready before loading places into menu
        fetch(s3rsc("all_rivers.json"))
            .then(res => res.json())
            .then(places => {
                this.places = places;
            
                // sort non-"All" places by alphabet
                var all = _.reject(places.places, function(p){return(p.id != "All")})
                var rest = _.reject(places.places, function(p){return(p.id == "All")});
                rest = _.sortBy(rest, "disp");
                var renderPlaces = {"places": rest.concat(all)};
                // load places into the menu
                var rendered = Mustache.render(window.templates["menu"], renderPlaces);
                $("#menu").html(rendered);
                $("#menu").removeClass("hidden");
            })
            .then(res => {

                // track map loading history; don't load the same map twice
                window.gps.state.maps = {};

                // load the current place in url if needed
                if (window.location.hash == "") {

                    // make sure url has this hash (e.g. default landing hash)
//                    window.location.hash = "#All";
                    window.location.hash = "#Russian_River";
                }
                else {
                    _.delay(to, 600, window.location.hash);
                }
        });
    }

    return {
        places : null,
        ready : ready
    };
})();