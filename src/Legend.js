import React from 'react';
import './Legend.scss';

const Legend = ({available, visible, colorRiver, colorTrack}) => {
    if (visible) {
        const addClass = (which) => `item ${available.indexOf(which) === -1 ? 'unavailable' : ''}`;
        return (
            <div id="legend">
                <div className={addClass("aud")}>
                    <div id="eg-aud" className="eg-marker"/>
                    <span>sound</span>
                </div>
                <div className={addClass("img")}>
                    <div id="eg-img" className="eg-marker"/>
                    <span>photo</span>
                </div>
                <div className={addClass("water")}>
                    <Point color={colorRiver}/>
                    <span>water feature</span>
                </div>
                <div className={addClass("human")}>
                    <Point color={colorTrack}/>
                    <span>human feature</span>
                </div>
                <div className={addClass("other")}>
                    <Point color={"#000000"}/>
                    <span>other feature</span>
                </div>
                <div className={addClass("river")}>
                    <Line color={colorRiver}/>
                    <span>river</span>
                </div>
                <div className={addClass("route")}>
                    <Line color={colorTrack}/>
                    <span>my route</span>
                </div>
            </div>
        )
    }
    else {
        return <div></div>
    }
};

const Point = ({color}) => {
    return (
        <svg width="35px">
            <circle r="5" cx="13" cy="13" fill={color}></circle>
        </svg>
    )
};

const Line = ({color}) => {
    return (
        <svg width="35px">
            <line x1="0" x2="25" y1="13" y2="13" stroke={color}></line>
        </svg>
    )
};

export default Legend;