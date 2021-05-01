import React, { useState } from 'react';
import Modal from '../../UI/Modal/Modal';

const JoinRoomModal = ({show, closeModal, joinRoomHandler}) => {
    const [input, setInput] = useState("");

    const joinRoom = () => {
        joinRoomHandler(input);
        setInput("");
    }

    return (
        <Modal buttonName="Join" addClickHandler={joinRoom} title="Join Room" show={show} closeModal={closeModal}>
            <input 
                onChange={(event) => setInput(event.target.value)} 
                value={input} 
                placeholder="Enter Room ID" 
                type="text" />
        </Modal>
    )
}

export default JoinRoomModal;