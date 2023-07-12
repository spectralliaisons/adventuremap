import React, {useState} from 'react';
import './Menu.scss';
let _ = require('underscore');

const fontSz = 14;
const padding = 6;
const listPaddingTop = 18;

const Menu = ({places}) => {

    const [menuState, setMenuState] = useState("loading");

    if (menuState === "loading" && _.size(places) > 0) {setMenuState("open");}

    function toggle() {
        if (menuState === "open") {setMenuState("closed");} 
        else {setMenuState("open");}
    }

    return (
        <div id='menu' className={menuState}>
            <Hamburger menuState={menuState} toggle={toggle}/>
            <Places menuState={menuState} places={places} />
        </div>
    );
};

const Hamburger = ({menuState, toggle}) => {
    const label = `${menuState === "open" ? "Close" : "Open"} map navigation menu.`;
    return (
        <button id="hamburger" className={menuState} onClick={toggle} title={label} aria-label={label}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </button>
    )
};

const Places = ({menuState, places}) => {
    const placesLs = _.chain(places)
        .keys()
        .map(pID => {
            const o = places[pID];
            return {id:pID, disp:o.disp, className:o.loaded ? "loaded" : "unloaded"};
        })
        .sortBy("disp")
        .value();
    const placesStyl = {
        height:`${(menuState === "open" ? (placesLs.length*(fontSz+padding*2)-padding*3+listPaddingTop) : 0)}px`,
        padding: `0px ${padding}px 0px ${padding}px`
    };
    const olStyl = {paddingTop: `${listPaddingTop}px`};
    return (
        <div id="places" className={menuState} style={placesStyl}>
            <ol style={olStyl}>{placesLs.map(p => 
                <div key={p.id}>
                    <Item id={p.id} className={p.className} disp={p.disp} />
                </div>
            )}</ol>
        </div>
    )
};

const Item = ({id, className, disp}) => {
    const label = `Show map of ${disp}.`;
    return (
        <li id={id} className={className} style={{fontSize:`${fontSz}px`}}><a href={"#"+id} title={label} aria-label={label}>{disp}</a></li>
    );
};

export default Menu;
