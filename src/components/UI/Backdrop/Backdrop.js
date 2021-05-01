import React from 'react';
import './Backdrop.css';

const Backdrop = ({show, closeBackdrop}) => {

    let displayOutput = null;
    if (true) {
        displayOutput = (
            <div onClick={closeBackdrop} className="Backdrop">

            </div>
        )
    } 

    return displayOutput;
}

export default Backdrop;