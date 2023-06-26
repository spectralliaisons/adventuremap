const to = ({paintPlace, setError}, hash) => {
    let curr = null;
    if (curr = hash.split("#")[1]) {
        paintPlace(curr).then(() => {
            let el = null;
            if (el = document.getElementById(curr)) {
                el.className = "loaded";
                setError(null);
            }
        })
    }
};

const out = {
    connect : cbs => {
        // If the url currently indicates a place, load it
        to(cbs, window.location.hash);
    
        window.onhashchange = () => {
            to(cbs, window.location.hash);
        }
    },
    setHash : (place) => window.location.hash = place
};

export default out;