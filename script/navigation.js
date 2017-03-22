// only load once
if (!window.loadContent) {
    
    $( document ).ready(function() {
        
        // prevent another click from registering if this script was already loaded
        $( "#map-container li a" ).unbind('click');
        $( "#map-container li a" ).click(function( event ) {
            
            event.preventDefault();
            href = $(this).attr('href');
            window.loadContent(href);
        });
    });   
        
    window.loadContent = function(href) {
        
        console.log("loadContent " + href);
        
        item = $(href)[0]
        
        console.log(item.id)
        
        initTracker(item.id)
        
        // no need to reload same page
        if (window.currpg == item)
            return
        
        // set the page title
        $.address.title($.address.title().split(' | ')[0] + ' | ' + item.id);
        
        // color current link
        window.currpg = item;
        
        // update navigation history
        history.pushState({id: item.id}, item.id, href)
    }
    
    // The following code is based off jquery.address-1.5/samples/tabs/index.html
    
    var tabs,
        tabEvent = false,
        initialTab = 'RussianRiver',
        navSelector = '#nav li a',
        navFilter = function(el) {
            return $(el).attr('href').replace(/^#/, '');
        },
        panelSelector = '#page',
        panelFilter = function() {
            $(panelSelector + ' a').filter(function() {
                return $(navSelector + ' a[title=' + $(this).attr('title') + ']').size() != 0;
            }).each(function(event) {
                $(this).attr('href', '#' + $(this).attr('title').replace(/ /g, '_'));
            });
        };
    
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
        }
    });
}