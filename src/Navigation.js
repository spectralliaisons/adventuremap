const connect = ({paintPlace}) => {
    // If the url currently indicates a place, load it
    to(window.location.hash, paintPlace);

    window.onhashchange = () => {
        to(window.location.hash, paintPlace);
    }
};

const to = (hash, paintPlace) => {
    let curr = null;
    if (curr = hash.split("#")[1]) {
        paintPlace(curr).then(() => {
            document.getElementById(curr).className = "loaded";
        })
    }
};

const setHash = (place) => window.location.hash = place;

export default {
    connect: connect,
    setHash: setHash
}