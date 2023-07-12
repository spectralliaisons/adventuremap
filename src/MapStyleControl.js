import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './MapStyleControl.scss';

const MapStyleControl = ({options, setStyleCb}) => {

    const [state, setState] = useState("closed");
    const [style, setStyle] = useState(options[0].url);

    useEffect(() => setStyleCb(style), [style]);

    function toggle() {
        if (state === "open") {setState("closed");} 
        else {setState("open");}
    }

    const label = `${state === "open" ? "Close" : "Open"} layer style menu.`;

    function styleLabel(name) {
        return `Set map style to ${name}`;
    }

    return (
        <div id="styles" className={state}>
            <div className="mapboxgl-ctrl mapboxgl-ctrl-group">
                <button className="mapboxgl-ctrl-icon" onClick={toggle} title={label} aria-label={label}><span className="material-icons">layers</span></button>
            </div>
            <ol>{options.map(({name, url}) => 
                <div key={name}>
                    <li className={style === url ? "selected" : ""} onClick={() => setStyle(url)} title={styleLabel(name)} aria-label={styleLabel(name)} >{name}</li>
                </div>
            )}</ol>
        </div>
    )
};

class MapBoxControl {
    constructor(options) {
        this.container = document.createElement('div');
        this.container.className = 'mapboxgl-ctrl';
        this.component = (<MapStyleControl options={options} setStyleCb={(url) => this.map.setStyle(url)} />);
    }
  
    onAdd(map) {
        this.map = map;
        this.render();
        return this.container;
    }
  
    onRemove() {
        this.container.parentNode.removeChild(this.container);
        this.map = undefined;
    }
  
    render() {
        ReactDOM.render(this.component, this.container);
    }
  }

export default MapBoxControl;
