import React from 'react';
import './Legend.scss';

const Legend = ({visible, colorRiver, colorTrack}) => {
    if (visible) {
        return (
            <div id="legend">
                <div className="item">
                    <div id="eg-aud" className="eg-marker"/>
                    <span>sound</span>
                </div>
                <div className="item">
                <div id="eg-img" className="eg-marker"/>
                    <span>photo</span>
                </div>
                <div className="item">
                    <Line color={colorRiver}/>
                    <span>river</span>
                </div>
                <div className="item">
                    <Line color={colorTrack}/>
                    <span>my track</span>
                </div>
            </div>
        )
    }
    else {
        return <div></div>
    }
};

const Line = ({color}) => {
    return (
        <svg width="35px">
            <line x1="0" x2="25" y1="13" y2="13" stroke={color}></line>
        </svg>
    )
};

export default Legend;