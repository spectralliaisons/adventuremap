window.nav = (() => {
    // set up UI event listeners when document ready
    $( document ).ready(() => {

        // menu is initially retracted
        $("#menu").hide();
        
        // tapping hamburger button slides menu down
        $("#hamburger").click(() => {
            $("#hamburger").toggleClass("open");
            $("#menu").slideToggle( "slow", () => {});
        });
    });   

    // enable back, fwd button history
    window.onpopstate = e => {
        if (e.state) {
            to('#' + e.state.id);
        }
    };

    // handle change of address (url hash)
    window.onhashchange = () => {
        to(window.location.hash)
    }
    
    // https://davidwalsh.name/query-string-javascript
    const getUrlParameter = name => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.href);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };
    
    // call this function when you want to load a place
    const to = fullHref => {
        
        // ignore url params
        const href = fullHref.split("?")[0];
        
        // url param to force place loading
        if (getUrlParameter("clear") == "true") {
            window.gps.clear();
        }

        // remove hash for the place name
        const place = href.replace("#", "");

        // set the page title
        document.title = document.title.split(' | ')[0] + ' | ' + place;

        // show all nav pages as inactive
        _.each(window.nav.places.places, p => {$("#" + p.id).removeClass('active')});
        // show the loading page nav tab as active
        $(href).addClass('active');

        // close menu
        if ($("#hamburger").hasClass("open")) {
            $("#hamburger").click();
            
            // wait for #hamburger animation to finish before doing all the taxing loading
            _.delay(window.gps.load, 600, place);
        }
        else {
            window.gps.load(place);
        }
    }
    
    // google maps api is ready
    const ready = () => {
        
        // wait until google maps api is ready before loading places into menu
        fetch(s3rsc("all_rivers.json"))
            .then(res => res.json())
            .then(({places}) => {
                window.nav.places = places;
                const renderPlaces = {"places": _.sortBy(places, "disp")};
                // load places into the menu
                const rendered = Mustache.render(window.templates["menu"], renderPlaces);
                $("#menu").html(rendered);
                $("#menu").removeClass("hidden");
            })
            .then(res => {

                // track map loading history; don't load the same map twice
                window.gps.state.maps = {};

                // load the current place in url if needed
                if (window.location.hash == "") {

                    // make sure url has this hash (e.g. default landing hash)
                    window.location.hash = "#Russian_River";
                }
                else {
                    _.delay(to, 600, window.location.hash);
                }
        })
        .catch(err => {
            console.log(["Error loading all_rivers.json", err])
        });
    }

    return {
        places : null,
        ready : ready
    };
})();