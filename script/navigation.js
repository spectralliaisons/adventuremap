// only load once
if (!window.loadContent) {
    
    $( document ).ready(function() {
        
        // tapping hamburger button slides menu down
        $( ".cross" ).hide();
        $( ".menu" ).hide();
        $( ".hamburger" ).click(function() {
            $( ".menu" ).slideToggle( "slow", function() {
                $( ".hamburger" ).hide();
                $( ".cross" ).show();
            });
        });

        $( ".cross" ).click(function() {
            $( ".menu" ).slideToggle( "slow", function() {
                $( ".cross" ).hide();
                $( ".hamburger" ).show();
            });
        });
        
        // prevent another click from registering if this script was already loaded
        $( ".menu li a" ).unbind('click');
        $( ".menu li a" ).click(function( event ) {
            
            event.preventDefault();
            href = $(this).attr('href');
            window.loadContent(href);
        });
    });   
    
    window.loadContent = function(href) {
        
        item = $(href)
        place = item.selector.replace("#", "");
        
        // set the page title
        $.address.title($.address.title().split(' | ')[0] + ' | ' + place);
        
        // update navigation history
        history.pushState({id: place}, place, href)
        
        // show page nav tab as active
        $(href).addClass('active')
        
        // load the gmap with this place data
        try {
            initTracker(place)
        }
        catch (error) {
            console.log("nope");
        }
    }
    
    // Initializes plugin features
    $.address.strict(false).wrap(true);
    
    // enable back, fwd button history
    // http://stackoverflow.com/questions/824349/modify-the-url-without-reloading-the-page/3354511#3354511
    window.onpopstate = function(e){
        if(e.state){
            
            window.loadContent('#' + e.state.id);
        }
    };
    
    // Address handler
    $.address.init(function(event) {
        
    }).change(function(event) {
    
        if (event.value != "") {
            window.loadContent('#' + event.value);
        } else {
            console.log("address changed to nowhere!");
        }
    });
}