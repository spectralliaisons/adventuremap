import React, {useState} from 'react';
import './Menu.scss';

const Menu = ({places}) => {

    return (
        <ol>{places.map(({disp,id}) => <div key={id}><Item disp={disp} id={id}/></div>)}</ol>
    );
};


const Item = ({disp, id}) => {
    const [loaded, setLoaded] = useState("unloaded");

    console.log(`Item disp: ${disp} id: ${id} loaded: ${loaded}`);

    function fetch() {
        setLoaded("loaded");
    }

    return (
        <li id={id} className={loaded} onClick={fetch}>{disp}</li>
    );
};

export default Menu;
