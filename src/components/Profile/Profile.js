import React, { useState } from 'react';
import { IconButton, Avatar } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import './Profile.css';

const Profile = ({show, imgURL, userId, userEmail, userName, closeProfile }) => {
    const [closing, setClosing] = useState(false);

    const closeProfileHandler = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            closeProfile();
        }, 300);
    }

    let displayOutput = null;
    if (show) {
        displayOutput = (
            <div className={"Profile " + (!closing ? "Profile_Show" : "Profile_Close")}>
                
                <div className="Profile_Header">
                    <IconButton color="inherit" onClick={closeProfileHandler}>
                        <KeyboardBackspaceIcon />
                    </IconButton>
                    <h2>Profile</h2>
                </div>

                <div className="Profile_Body">
                    <Avatar src={imgURL} />
                    <h1>{userName}</h1>
                    <div className="Profile_Details">
                        
                        <p><h4>User ID:</h4> {userId}</p>
                        
                        <p><h4>Email:</h4> {userEmail}</p>
                    </div>
                    
                </div>
                
            </div>
        )
    }

    return displayOutput;
}

export default Profile;