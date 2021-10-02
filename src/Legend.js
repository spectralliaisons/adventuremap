import React from 'react';
import './Legend.scss';

const Legend = ({colorRiver, colorTrack}) => {
    return (
        <div id="legend">
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
};

const Line = ({color}) => {
    return (
        <svg width="35px">
            <line x1="0" x2="35" y1="13" y2="13" stroke={color}></line>
        </svg>
    )
};

export default Legend;