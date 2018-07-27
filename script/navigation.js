// only load once
if (!window.loadContent) {
    
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
            
            // close menu
            $("#hamburger").click();
            
            // load the place clicked on in the menu
            event.preventDefault();
            href = $(this).attr('href');
            
            // update navigation history
            place = href.replace("#", "");
            window.history.pushState({id: place}, place, href);
            
            window.loadContent(href);
        });
    });   
    
    window.loadContent = function(href) {
        
        console.log("loadContent " + href);
        
        // remove hash for the place name
        place = href.replace("#", "");
        
        // set the page title
        document.title = document.title.split(' | ')[0] + ' | ' + place;

        // show all nav pages as inactive
        $("#menu ul a").each(function(i,a){$(a).removeClass('active')});
        // show the loading page nav tab as active
        $(href).addClass('active');
        
        // load the gmap with this place data
        initTracker(place);
    }
    
    // enable back, fwd button history
    window.onpopstate = function(e) {
        if (e.state) {
            window.loadContent('#' + e.state.id);
        }
    };
    
    // handle change of address (url hash)
    window.onhashchange = function() {
        window.loadContent(window.location.hash);
    }
}