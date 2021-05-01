import React, { useState } from 'react';
import Modal from '../../UI/Modal/Modal';

const InputVideoModal = ({show, closeModal, sendVideoHandler}) => {
    const [video, setVideo] = useState("");

    const sendVideo = () => {
        sendVideoHandler(video);
        setVideo("");
    }

    const handleVideoFile = (event) => {
        const vid = event.target.files[0];
        setVideo(vid);
    }

    return (
        <Modal buttonName="Send" addClickHandler={sendVideo} title="Select Video" show={show} closeModal={closeModal}>
            <input 
                accept=".mp4, .mov, .mkv, .MPEG-4, .ogg, webm"
                onChange={handleVideoFile}  
                type="file" />
        </Modal>
    )
}

export default InputVideoModal;