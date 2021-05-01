import React, { useState, useEffect } from 'react';
import CancelIcon from '@material-ui/icons/Cancel';
import { IconButton } from '@material-ui/core';
import './Modal.css';
 
import Backdrop from '../Backdrop/Backdrop';
import { Button } from '@material-ui/core';

const Modal = ({show, buttonName, children, closeModal, addClickHandler, title}) => {
    const [closing, setClosing] = useState(false);
    
    const closeModalHandler = () => {
        setClosing(true);
        setTimeout(() => closeModal(), 300);
    }

    useEffect(() => {
        return () => {
            setClosing(false);
        }
        
    }, [show])

    const addClick = (event) => {
        event.preventDefault();
        addClickHandler();
        setClosing(true);

        setTimeout(() => closeModal(), 300);
    }

    let displayOutput = null;
    if (show) {
        displayOutput = (
            <>
                <Backdrop show={show} closeBackdrop={closeModalHandler} />
                <div className={"Modal " + (!closing ? "Modal_Show" : "Modal_Close")}>
                    <form onSubmit={addClick}>
                        <div className="Modal_Header">
                            <h1>{title}</h1>
                            <IconButton onClick={closeModalHandler}>
                                <CancelIcon />
                            </IconButton>
                        </div>
                        <div className="Modal_Body">
                            
                                {children}
                            
                        </div>
                        <div className="Modal_Footer">
                            <Button size="small" onClick={closeModalHandler} variant="contained">Cancel</Button>
                            <Button size="small" onClick={addClick} variant="contained">{buttonName}</Button>
                        </div>
                    </form>
                </div>
            </>
        )
    }

    return displayOutput;
}

export default Modal;