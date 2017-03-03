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
        
        dest = $(href)[0].id
        
        console.log(dest)
        
        initTracker(dest)
    }
}