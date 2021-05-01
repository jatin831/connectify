import React, { useState, useEffect, useRef } from 'react';
import Message from './Message/Message';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { selectUserData } from '../../reducers/authSlice';
import db, { storage } from '../../firebase';
import firebase from 'firebase';
import './Chat.css';
import UserInfo from './UserInfo/UserInfo';
import InputImgModal from './ChatModals/InputImgModal';
import InputVideoModal from './ChatModals/InputVideoModal';
import { isUserOnline, timestampToLocalTime } from '../../utility';

// eslint-disable-next-line
import { Avatar, IconButton, Menu, MenuItem, Snackbar, CircularProgress } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import ImageIcon from '@material-ui/icons/Image';
import MuiAlert from '@material-ui/lab/Alert';

const calcMessageHashKey = (s1, s2) => {
    let messageHashKey = null;
    if (s1 < s2) {
        messageHashKey = s1 + s2;
    } else {
        messageHashKey = s2 + s1;
    }
    return messageHashKey;
}

const Chat = () => {
    
    const senderUserId = useParams().userId;
    const roomId = useParams().roomId;
    const [messages, setMessages] = useState([]);
    const userData = useSelector(selectUserData);
    const [input, setInput] = useState("");
    const messageEndRef = useRef(null);
    const [chatData, setChatData] = useState([]);
    const [anchorEl, setAnchorEl] = useState();
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [showImgModal, setShowImgModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showError, setShowError] = useState("");
    const [loading, setLoading] = useState(false);

    let messageHashKey = null;
    if (senderUserId) {
        messageHashKey = calcMessageHashKey(userData.userId, senderUserId);
    } else if (roomId) {
        messageHashKey = roomId;
    }

    const getMessages = () => {
        
        if (!messageHashKey) return;
        setLoading(true);
        db.collection("messages").doc(messageHashKey).collection("messages").orderBy("timestamp").onSnapshot(snapshot => {
            let messages = []
            snapshot.docs.forEach(message => {
                messages.push({
                    type: message.data().type,
                    message: message.data().message,
                    author: message.data().authorName,
                    imgURL: message.data().imgURL,
                    videoURL: message.data().videoURL,
                    timestamp: message.data().timestamp,
                    authorId: message.data().authorId
                })
            })
            setMessages(messages);
            setLoading(false);
        })
    }

    const getSenderInfo = () => {
        db.collection("contacts").doc(senderUserId).onSnapshot(snapshot => {
            setChatData({
                userId: snapshot.data().userId,
                userImg: snapshot.data().userImg,
                userEmail: snapshot.data().userEmail,
                userName: snapshot.data().userName,
                lastSeen: snapshot.data().lastSeen,
                online: isUserOnline(snapshot.data().lastSeen)
            })
        })
    }

    const getRoomInfo = () => {
        db.collection("rooms").doc(roomId).onSnapshot(snapshot => {
            setChatData({
                roomName: snapshot.data().roomName,
                roomId: snapshot.id,
                roomImg: snapshot.data().roomImg
            })
        })
    }

    useEffect(() => {
        if (senderUserId) {
            getSenderInfo();    
        } else if (roomId) {
            getRoomInfo();
        }
        getMessages();
        setInput("");
    }, [senderUserId, roomId])

    const sendMessageHandler = (event) => {
        event.preventDefault();
        if (messageHashKey) {
            db.collection("messages").doc(messageHashKey).collection("messages").add({
                authorId: userData.userId,
                authorName: userData.userName,
                imgURL: null,
                message: input,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                type: "text",
                videoURL: null
            });
        }
        setInput("");
    }

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView();
    }

    useEffect(() => {
        if (window.location.pathname.slice(6) == roomId)
        {
            scrollToBottom();
        }
    }, [messages])

    const closeMenuHandler = () => {
        setAnchorEl(null);
    }

    const showMenuHandler = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const setUserInfoHandler = () => {
        closeMenuHandler();
        setShowUserInfo(true);
    }

    const closeUserInfo = () => {
        setShowUserInfo(false);
    }

    const closeAllModals = () => {
        setShowImgModal(false);
        setShowVideoModal(false);
    }

    const sendImgHandler = (imgFile) => {
        if (!imgFile) {
            setShowError("Please select an Image");
            return;
        }
        const imgExtensions = ["jpg", "jpeg", "png"];
        let isValid = false;
        imgExtensions.forEach(ext => {
            if (ext === imgFile.name.slice(-(ext.length)).toLowerCase()) {
                isValid = true;
                const uploadTask = storage.ref(`images/${imgFile.name}`).put(imgFile);
                uploadTask.on('state_changed', console.log, console.error, () => {
                    storage.ref('images').child(imgFile.name).getDownloadURL()
                        .then(firebaseURL => {
                            if (messageHashKey) {
                                db.collection("messages").doc(messageHashKey).collection("messages").add({
                                    authorId: userData.userId,
                                    authorName: userData.userName,
                                    imgURL: firebaseURL,
                                    message: null,
                                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                    type: "img",
                                    videoURL: null
                                });
                            }
                        })
                })
            }
        })
        if (!isValid) {
            setShowError("Invalid File Type")
        }
    }

    const sendVideoHandler = (videoFile) => {
        if (!videoFile) {
            setShowError("Please select a video");
            return;
        }
        const videoExtensions = ["mp4", "mov", "mkv", "mpeg-4", ".ogg", "webm"];
        let isValid = false;
        videoExtensions.forEach(ext => {
            if (ext === videoFile.name.slice(-(ext.length)).toLowerCase()) {
                isValid = true;
                const uploadTask = storage.ref(`videos/${videoFile.name}`).put(videoFile);
                uploadTask.on('state_changed', console.log, console.error, () => {
                    storage.ref('videos').child(videoFile.name).getDownloadURL()
                        .then(firebaseURL => {
                            if (messageHashKey) {
                                db.collection("messages").doc(messageHashKey).collection("messages").add({
                                    authorId: userData.userId,
                                    authorName: userData.userName,
                                    imgURL: null,
                                    message: null,
                                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                    type: "video",
                                    videoURL: firebaseURL
                                });
                            }
                        })
                })
            }
        })
        if (!isValid) {
            setShowError("Invalid File Type")
        }
    }

    const handleClose = () => {
        setShowError("");
    }

    return (
        <>
            <Snackbar open={showError !== ""} autoHideDuration={6000} onClose={handleClose}>
                <MuiAlert onClose={handleClose} severity="error" elevation={6} variant="filled">
                    {showError}
                </MuiAlert>
            </Snackbar>
            <InputImgModal
                show={showImgModal}
                closeModal={closeAllModals}
                sendImgHandler={sendImgHandler} 
            />
            <InputVideoModal
                show={showVideoModal}
                closeModal={closeAllModals}
                sendVideoHandler={sendVideoHandler} 
            />
            <div className="Chat">
                <UserInfo
                    show={showUserInfo}
                    closeUserInfo={closeUserInfo}
                    userName={chatData.userName}
                    userEmail={chatData.userEmail}
                    userId={chatData.userId}
                    userImg={chatData.userImg}
                    roomImg={chatData.roomImg}
                    roomId={chatData.roomId}
                    roomName={chatData.roomName}
                    />
                <div className="Chat_Header">
                    <div className="Chat_HeaderInfo">
                        <Avatar onClick={setUserInfoHandler} src={chatData.userImg || chatData.roomImg} />
                        <div className="Chat_Info">
                            <h3>{chatData.userName || chatData.roomName}</h3>
                            <p>
                                {
                                    chatData.online ?
                                        <>
                                            <span>Online</span><span className="Online"/>
                                        </> : chatData.lastSeen ?
                                        "Last seen at " + timestampToLocalTime(chatData.lastSeen) : "Room" 
                                }
                            </p>
                        </div>
                    </div>
                    <IconButton onClick={showMenuHandler} color="inherit">
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        color="dark"
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        anchorPosition={{
                            vertical: 'bottom',
                            horizontal: 'center'
                        }}
                        open={Boolean(anchorEl)}
                        onClose={closeMenuHandler}
                    >
                        {
                            senderUserId ? <MenuItem onClick={setUserInfoHandler}>User Info</MenuItem>
                                : <MenuItem onClick={setUserInfoHandler}>Room Info</MenuItem>
                        }
                        
                    </Menu>
                </div>
                <div className="Chat_Body">
                {
                    loading ? <CircularProgress variant="indeterminate" thickness={2} size={100} /> :
                    messages.map(message => {
                        return (
                            <Message 
                                key={message.timestamp}
                                message={message.message} 
                                type={message.type} 
                                videoURL={message.videoURL}
                                imgURL={message.imgURL} 
                                author={message.author}
                                timestamp={message.timestamp}
                                currentUserId={userData.userId}
                                authorUserId={message.authorId} />
                        )
                    })
                }
                <div ref={messageEndRef} />
                </div>
                <div className="Chat_Footer">
                    <IconButton color="inherit" onClick={() => setShowImgModal(true)}>
                        <ImageIcon />
                    </IconButton>
                    <form onSubmit={sendMessageHandler}>
                        <input onChange={(event) => setInput(event.target.value)} value={input} placeholder="Type a message" type="text"/>
                        <button>Send a message</button>
                    </form>
                    <IconButton onClick={() => setShowVideoModal(true)} color="inherit">
                        <VideoCallIcon />
                    </IconButton>
                </div>
            </div>
        </>
    )
}

export default Chat;