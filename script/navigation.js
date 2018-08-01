window.nav = (function(){
    // set up UI event listeners when document ready
    $( document ).ready(function() {

        // menu is initially retracted
        $("#menu").hide();

        // tapping hamburger button slides menu down
        $("#hamburger").click(function(){
            $(this).toggleClass("open");
            $( "#menu" ).slideToggle( "slow", function() {});
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
    
    // call this function when you want to load a place
    to = function(href) {

        console.log("nav to " + href);

        // remove hash for the place name
        place = href.replace("#", "");

        // set the page title
        document.title = document.title.split(' | ')[0] + ' | ' + place;

        // show all nav pages as inactive
        _.each(this.nav.places.places, function(p){$("#" + p.id).removeClass('active')});
        // show the loading page nav tab as active
        $(href).addClass('active');

        // close menu
        if ($("#hamburger").hasClass("open")) {
            $("#hamburger").click();
        }

        // load the gmap with this place data
        if (place == "All") {
            // load all not loaded places
            var unloadedPlaces = _.filter(_.pluck(window.nav.places.places, "id"), function(place){return(place != "All" && window.maps[place] == undefined)});
            window.gps.loadMultiple(unloadedPlaces);
            
        }
        else {
            window.gps.load(place);
        }
    }
    
    // google maps api is ready
    ready = function() {
        console.log("nav.ready()");
        
        // wait until google maps api is ready before loading places into menu
        fetch(cacheBust("./gps/Places/all_rivers.json"))
            .then(res => res.json())
            .then(places => {
                this.places = places;
                
                // sort non-"All" places by alphabet
                var all = _.reject(places.places, function(p){return(p.id != "All")})
                var rest = _.reject(places.places, function(p){return(p.id == "All")});
                rest = _.sortBy(rest, "disp");
                var renderPlaces = {"places": rest.concat(all)};
                console.log(renderPlaces);
                // load places into the menu
                var rendered = Mustache.render(window.templates["menu"], renderPlaces);
                $('#menu').html(rendered);
            })
            .then(res => {

                // track map loading history; don't load the same map twice
                window.maps = {};

                // load the current place in url if needed
                if (window.location.hash == "") {

                    // make sure url has this hash (e.g. default landing hash)
                    window.location.hash = "#Russian_River";
                }
                else {
                    to(window.location.hash);
                }
        });
    }

    return {
        places : null,
        ready : ready
    };
})();