import React from 'react';
import './AdminChat.css';
import Img from '../../assets/connectify.svg';

const AdminChat = () => {
    return (
        <div className="Admin">
            <div className="Admin_Body">
                <img src={Img} alt="" />
                <h1>Connectify</h1>
                <p>
                    Use userID <span>wTW6gKKPAsQnmkVAGpUG46Hu3gr2</span> for contacting the ADMIN
                </p>
            </div>
        </div>
    )
}

export default AdminChat;