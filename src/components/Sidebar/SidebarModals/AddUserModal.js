import React, { useState } from 'react';

import Modal from '../../UI/Modal/Modal';

const AddUserModal = ({show, closeModal, addUserHandler}) => {
    const [input, setInput] = useState("");

    const addUser = () => {
        addUserHandler(input);
        setInput("");
    }

    return (
        <Modal buttonName="Add" addClickHandler={addUser} title="Add User" show={show} closeModal={closeModal}>
            <input onChange={(event) => setInput(event.target.value)} value={input} placeholder="Enter UserID" type="text" />
        </Modal>
    )
}

export default AddUserModal;