import React, {useState} from 'react';
import './Menu.scss';

const Menu = ({paintPlace, places}) => {

    return (
        <ol>{places.map(({disp,id}) => <div key={id}><Item paintPlace={paintPlace} disp={disp} id={id}/></div>)}</ol>
    );
};


const Item = ({paintPlace, disp, id}) => {
    const [loaded, setLoaded] = useState("unloaded");

    function fetch() {
        paintPlace(id).then(() => setLoaded("loaded"));
    }

    return (
        <li id={id} className={loaded} onClick={fetch}>{disp}</li>
    );
};

export default Menu;
