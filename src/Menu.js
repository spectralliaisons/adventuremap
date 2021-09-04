import React, {useState} from 'react';
import './Menu.scss';

const Menu = ({loadPlace, places}) => {

    return (
        <ol>{places.map(({disp,id}) => <div key={id}><Item loadPlace={loadPlace} disp={disp} id={id}/></div>)}</ol>
    );
};


const Item = ({loadPlace, disp, id}) => {
    const [loaded, setLoaded] = useState("unloaded");

    console.log(`Item disp: ${disp} id: ${id} loaded: ${loaded}`);

    function fetch() {
        loadPlace(id).then(() => setLoaded("loaded"));
    }

    return (
        <li id={id} className={loaded} onClick={fetch}>{disp}</li>
    );
};

export default Menu;
