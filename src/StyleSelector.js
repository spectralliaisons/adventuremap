import React, { useState } from 'react';
import './StyleSelector.scss';

const StyleSelector = ({options, style, setStyle}) => {

    const [state, setState] = useState("closed");

    function toggle() {
        if (state === "open") {setState("closed");} 
        else {setState("open");}
    }

    return (
        <div id="styles" className={state}>
            <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                <button class="mapboxgl-ctrl-icon" onClick={toggle}><span className="material-icons close">layers</span></button>
            </div>
            <ol>{options.map(({name, url}) => 
                <div key={name}>
                    <li className={style === url ? "selected" : ""} onClick={() => setStyle(url)}>{name}</li>
                </div>
            )}</ol>
        </div>
    )
};

export default StyleSelector;
