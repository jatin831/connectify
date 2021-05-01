import React, { useState, useEffect } from 'react';
import { IconButton, Avatar } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import Backdrop from '../../UI/Backdrop/Backdrop';
import './UserInfo.css';
import db from '../../../firebase';

const UserInfo = ({show, closeUserInfo, userImg, userName, userEmail, userId, roomId, roomName, roomImg }) => {
    const [closing, setClosing] = useState(false);
    const [members, setMembers] = useState([]);

    const getMembers = () => {
        db.collection("rooms").doc(roomId).collection("members").onSnapshot(snapshot => {
            let memberList = snapshot.docs.map(room => {
                return room.id
            })
            db.collection("contacts").where("userId", "in", memberList).onSnapshot(snapshot2 => {
                setMembers(snapshot2.docs.map(member => {
                    return {
                        userName: member.data().userName,
                        userId: member.data().userId,
                        userImg: member.data().userImg
                    }
                }))
            })
        })
    }

    useEffect(() => {
        if (roomId) {
            getMembers();
        }
    }, [roomId])

    const closeUserInfoHandler = () => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            closeUserInfo();
        }, 300);
    }

    let displayOutput = null;
    if (show) {
        if (userId) {
            displayOutput = (
                <>
                    <Backdrop show closeBackdrop={closeUserInfoHandler} />
                    <div className={"UserInfo " + (!closing ? "UserInfo_Show" : "UserInfo_Close")}>
                        <div className="UserInfo_Header">
                            <IconButton onClick = {closeUserInfoHandler}>
                                <KeyboardBackspaceIcon />
                            </IconButton>
                            <h3>User Info</h3>
                        </div>
                        
                        <div className="UserInfo_Body">
                            <Avatar src={userImg} />
                            <h1>{userName}</h1>
                            <div>
                                <p><span>UserID: </span>{userId}</p>
                                <p><span>Email: </span>{userEmail}</p>
                            </div>
                            
                        </div>
                    </div>
                </>
            );
        } else {
            displayOutput = (
                <>
                    <Backdrop show closeBackdrop={closeUserInfoHandler} />
                    <div className={"UserInfo " + (!closing ? "UserInfo_Show" : "UserInfo_Close")}>
                        <div className="UserInfo_Header">
                            <IconButton onClick = {closeUserInfoHandler}>
                                <KeyboardBackspaceIcon />
                            </IconButton>
                            <h3>Room Info</h3>
                        </div>
                        
                        <div className="UserInfo_Body">
                            <Avatar src={roomImg} />
                            <h1>{roomName}</h1>
                            <div className="Members">
                                <p><span>RoomID: </span>{roomId}</p>
                                <h2>Members: </h2>
                                {members.map(member => {
                                    return (
                                        <div key={member.userId} className="Members_Info">
                                            <Avatar src={member.userImg} />
                                            <div className="Members_Detail">
                                                <h3>{member.userName}</h3>
                                                <p>{member.userId}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            
                        </div>
                    </div>
                </>
            )
            
        }
        
    } 

    return displayOutput;
}

export default UserInfo;