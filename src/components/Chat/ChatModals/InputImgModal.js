import React, { useState } from 'react';
import Modal from '../../UI/Modal/Modal';

const InputImgModal = ({show, closeModal, sendImgHandler}) => {
    const [img, setImg] = useState("");

    const sendImg = () => {
        sendImgHandler(img);
        setImg("");
    }

    const handleImageFile = (event) => {
        const image = event.target.files[0];
        setImg(image);
    }

    return (
        <Modal buttonName="Send" addClickHandler={sendImg} title="Select Image" show={show} closeModal={closeModal}>
                <input
                    id="hide"
                    accept=".jpg, .png., .jpeg, .PNG"
                    onChange={handleImageFile}  
                    type="file" />
        </Modal>
    )
}

export default InputImgModal;