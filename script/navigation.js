// set up UI event listeners when document ready
$( document ).ready(function() {

    // menu is initially retracted
    $( "#menu" ).hide();

    // tapping hamburger button slides menu down
    $("#hamburger").click(function(){
        $(this).toggleClass('open');
        $( "#menu" ).slideToggle( "slow", function() {});
    });

    // prevent another click from registering if this script was already loaded
    $( "#menu ul a" ).unbind('click');
    $( "#menu ul a" ).click(function( event ) {
        
        console.log("MENU ITEM SELECTED");

        // load the place clicked on in the menu
        event.preventDefault();
        href = $(this).attr('href');

        // update navigation history
        place = href.replace("#", "");
        window.history.pushState({id: place}, place, href);
        
//        window.nav.to(href).then(res => {
//            console.log("close menu");
//            // close menu
//            $("#hamburger").click();
//        });
    });
});   

// enable back, fwd button history
window.onpopstate = function(e) {
    if (e.state) {
        window.nav.to('#' + e.state.id);
    }
};

// handle change of address (url hash)
window.onhashchange = function() {
    window.nav.to(window.location.hash)
}

window.nav = {
    // google maps api is ready
    ready : function() {
        console.log("nav.ready()");
        // wait until google maps api is ready before loading places into menu
        fetch("./gps/Places/all_rivers.json")
            .then(res => res.json())
            .then(places => {
                // load places into the menu
                var rendered = Mustache.render(window.templates["menu"], places);
                $('#menu').html(rendered);
            })
            .then(res => {

                // track map loading history; don't load the same map twice
                window.maps = {};

                // load the current place in url if needed
                if (window.location.hash == "") {

                    // make sure url has this hash (e.g. default landing hash)
                    window.location.hash = "#RussianRiver";
                }
                else {
                    window.nav.to(window.location.hash);
                }
        });
    },
    // call this function when you want to load a place
    to : function(href) {

        console.log("nav.to() :: " + href);

        // remove hash for the place name
        place = href.replace("#", "");

        // set the page title
        document.title = document.title.split(' | ')[0] + ' | ' + place;

        // show all nav pages as inactive
        $("#menu ul a").each(function(i,a){$(a).removeClass('active')});
        // show the loading page nav tab as active
        $(href).addClass('active');
        
        // close menu
        if ($("#hamburger").hasClass("open")) {
            $("#hamburger").click();
        }

        // load the gmap with this place data
        window.gps.load(place);
    }
};