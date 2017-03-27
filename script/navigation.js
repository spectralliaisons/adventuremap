// only load once
if (!window.loadContent) {
    
    $( document ).ready(function() {
        
        // prevent another click from registering if this script was already loaded
        $( ".navbar li a" ).unbind('click');
        $( ".navbar li a" ).click(function( event ) {
            
            console.log("CLICK .navbar li a");
            
            event.preventDefault();
            href = $(this).attr('href');
            window.loadContent(href);
        });
    });   
    
    window.loadContent = function(href) {
        
        console.log("loadContent " + href);
        
        item = $(href)
        place = item.selector.replace("#", "");
        
        // no need to reload same page
//        if (location.hash == item.selector) { return; }
        
        console.log(place)
        
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
    
    // The following code is based off jquery.address-1.5/samples/tabs/index.html
    
//    var tabs,
//        tabEvent = false,
//        initialTab = 'RussianRiver',
//        navSelector = '#navbar li a',
//        navFilter = function(el) {
//            return $(el).attr('href').replace(/^#/, '');
//        },
//        panelSelector = '#page',
//        panelFilter = function() {
//            $(panelSelector + ' a').filter(function() {
//                return $(navSelector + ' a[title=' + $(this).attr('title') + ']').size() != 0;
//            }).each(function(event) {
//                $(this).attr('href', '#' + $(this).attr('title').replace(/ /g, '_'));
//            });
//        };
    
    // Initializes plugin features
    $.address.strict(false).wrap(true);
    
//    if ($.address.value() == '') {
//        $.address.history(false).value(initialTab).history(true);
//    }
    
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
            window.loadContent('#RussianRiver');
        }
    });
}