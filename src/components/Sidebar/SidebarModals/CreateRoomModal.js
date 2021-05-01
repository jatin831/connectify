import React, { useState } from 'react';

import Modal from '../../UI/Modal/Modal';

const CreateRoomModal = ({show, closeModal, createRoomHandler}) => {
    const [input, setInput] = useState("");

    const createRoom = () => {
        createRoomHandler(input);
        setInput("");
    }

    return (
        <Modal buttonName="Create" addClickHandler={createRoom} title="Create Room" show={show} closeModal={closeModal}>
            <input 
                onChange={(event) => setInput(event.target.value)} 
                value={input} 
                placeholder="Enter Room Name" 
                type="text" />
        </Modal>
    )
}

export default CreateRoomModal;