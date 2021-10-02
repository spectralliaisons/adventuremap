import React, {useState} from 'react';
import './Menu.scss';

const fontSz = 14;
const padding = 6;
const listPaddingTop = 18;

const Menu = ({paintPlace, places}) => {

    const [menuState, setMenuState] = useState("loading");

    if (menuState === "loading" && places.length > 0) {setMenuState("open");}

    function toggle() {
        if (menuState === "open") {setMenuState("closed");} 
        else {setMenuState("open");}
    }

    return (
        <div id='menu' className={menuState}>
            <Hamburger menuState={menuState} toggle={toggle}/>
            <Places menuState={menuState} paintPlace={paintPlace} places={places} toggle={toggle}/>
        </div>
    );
};

const Hamburger = ({menuState, toggle}) => {
    return (
        <div id="hamburger" className={menuState} onClick={toggle}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
    )
};

const Places = ({menuState, paintPlace, places, toggle}) => {
    const placesStyl = {
        height:`${(menuState === "open" ? (places.length*(fontSz+padding*2)-padding*3+listPaddingTop) : 0)}px`,
        padding: `0px ${padding}px 0px ${padding}px`
    };
    const olStyl = {paddingTop: `${listPaddingTop}px`};
    return (
        <div id="places" className={menuState} style={placesStyl}>
            <ol style={olStyl}>{places.map(({disp,id}) => 
                <div key={id}>
                    <Item paintPlace={paintPlace} closeMenu={toggle} disp={disp} id={id}/>
                </div>
            )}</ol>
        </div>
    )
};

const Item = ({paintPlace, closeMenu, disp, id}) => {
    const [loaded, setLoaded] = useState("unloaded");

    function fetch() {
        paintPlace(id).then(() => {
            setLoaded("loaded");
            closeMenu();
        });
    }

    return (
        <li id={id} className={loaded} style={{fontSize:`${fontSz}px`}} onClick={fetch}>{disp}</li>
    );
};

export default Menu;
