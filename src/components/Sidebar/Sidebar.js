import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import db from '../../firebase';
import './Sidebar.css';
import { LOGOUT, selectUserData } from '../../reducers/authSlice';
import AddUserModal from './SidebarModals/AddUserModal';
import CreateRoomModal from './SidebarModals/CreateRoomModal';
import JoinRoomModal from './SidebarModals/JoinRoomModal';
import Profile from '../Profile/Profile';
import { isUserOnline } from '../../utility';

import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import { Avatar, IconButton, Menu, MenuItem, Snackbar, CircularProgress } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SidebarChat from './SidebarChat/SidebarChat';

const calcMessageHashKey = (s1, s2) => {
    let messageHashKey = null;
    if (s1 < s2) {
        messageHashKey = s1 + s2;
    } else {
        messageHashKey = s2 + s1;
    }
    return messageHashKey;
}

const Sidebar = ({update}) => {
    const dispatch = useDispatch();
    const userData = useSelector(selectUserData);
    const contacts = db.collection("contacts");
    const [anchorEl, setAnchorEl] = useState();
    const [userContactList, setUserContactList] = useState([]);
    const [roomsList, setRoomsList] = useState([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showJoinRoom, setShowJoinRoom] = useState(false);
    const [showError, setShowError] = useState("");
    const [showProfile, setShowProfile] = useState(false);
    const [usersLastUpdate, setUsersLastUpdate] = useState({});
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState("");
    const [input, setInput] = useState("");

    const showMenuHandler = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const closeMenuHandler = () => {
        setAnchorEl(null);
    }

    const logoutHandler = () => {
        closeMenuHandler();
        dispatch(LOGOUT());
    }

    const getUserDetails = () => {
        
        if (userData.userId) {
            let users = [];
            setUsersLoading(true)
            contacts.doc(userData.userId).collection("contactList").onSnapshot(snapshot => {
                users = snapshot.docs.map(doc => {
                    return doc.id;
                })
                if (users.length === 0) {
                    setUsersLoading(false);
                    return;
                };
                contacts.where("userId", "in", users).onSnapshot(async snapshot2 => {
                    let contactList = snapshot2.docs.map(async user => {
                        let response = await db.collection("messages").doc(calcMessageHashKey(user.data().userId, userData.userId)).collection("messages").orderBy("timestamp", "desc").limit(1).get();
                        let lastMessage = null;
                        if (response.docs[0]) {
                            response = response.docs[0].data(); 
                            if (response.type === "text") {
                                lastMessage = response.message;
                            } else if (response.type === "img") {
                                lastMessage = "--Image--";
                            } else if (response.type === "video") {
                                lastMessage = "--Video--";
                            }
                        }
                        return {
                            userId: user.data().userId,
                            userName: user.data().userName,
                            userEmail: user.data().userEmail,
                            userImg: user.data().userImg,
                            lastMessage
                        }
                    })
                    contactList = await Promise.all(contactList);
                    setUserContactList(contactList);
                    setUsersLoading(false);
                })
            })
        }  
    }

    // Checking real time status of other users
    useEffect(() => {
        if (userContactList) {
            userContactList.forEach(user => {
                db.collection("contacts").doc(user.userId).onSnapshot(snapshot => {
                    setUsersLastUpdate(prevState => {
                        return {
                            ...prevState,
                            [user.userId]: {
                                lastSeen: snapshot.data().lastSeen,
                                online: isUserOnline(snapshot.data().lastSeen)
                            }
                        }
                    })
                })
            })
        }
    }, [userContactList, update])

    const getRoomsList = () => {
        if (userData.userId) {
            let rooms = [];
            setRoomsLoading(true);
            contacts.doc(userData.userId).collection("rooms").onSnapshot(async snapshot => {
                rooms = snapshot.docs.map(doc => {
                    return doc.id;
                })
                if (rooms.length === 0) {
                    setRoomsLoading(false);
                    return;
                }
                db.collection("rooms").where("roomId", "in", rooms).onSnapshot(async snapshot2 => {
                    let roomList = snapshot2.docs.map(async room => {
                        let response = await db.collection("messages").doc(room.data().roomId).collection("messages").orderBy("timestamp", "desc").limit(1).get();
                        let lastMessage = null;
                        if (response.docs[0]) {
                            response = response.docs[0].data(); 
                            if (response.type === "text") {
                                lastMessage = response.message;
                            } else if (response.type === "img") {
                                lastMessage = "--Image--";
                            } else if (response.type === "video") {
                                lastMessage = "--Video--";
                            }
                        }
                        
                        return {
                            roomId: room.data().roomId,
                            roomName: room.data().roomName,
                            roomImg: room.data().roomImg,
                            lastMessage
                        }
                    })
                    roomList = await Promise.all(roomList);
                    setRoomsList(roomList);
                    setRoomsLoading(false);
                })
            })
        }
    }

    useEffect(() => {
        getUserDetails(); 
        getRoomsList();
    }, [])

    const addUser = () => {
        closeMenuHandler();
        setShowAddUser(true)
    }

    const closeAllModals = () => {
        setShowAddUser(false);
        setShowCreateRoom(false);
        setShowJoinRoom(false);
    }

    const addUserHandler = (userId) => {
        if (userId === "" || userId === userData.userId) {
            setShowError("Invalid userID");
            return;
        }
        contacts.doc(userId).get().then(snapshot => {
            if (snapshot.exists) {
                contacts.doc(userId).collection("contactList").doc(userData.userId).set({});
                contacts.doc(userData.userId).collection("contactList").doc(userId).set({});
                
                db.collection("messages").doc(calcMessageHashKey(userData.userId, userId)).set({});
            }
            else {
                setShowError("userID doesn't Exists")
            }
        })
    }

    const handleClose = () => {
        setShowError("");
        setShowSuccess("");
    }

    const showProfileHandler = () => {
        closeMenuHandler();
        setShowProfile(true);
    }

    const createRoomModal = () => {
        closeMenuHandler();
        setShowCreateRoom(true);
    }

    const createRoomHandler = (roomName) => {
        if (roomName === "") {
            setShowError("Invalid room name");
            return;
        }
        db.collection("rooms").add({
            roomName: roomName
        }).then(response => {
            contacts.doc(userData.userId).collection("rooms").doc(response.id).set({});
            db.collection("messages").doc(response.id).set({});
            db.collection("rooms").doc(response.id).collection("members").doc(userData.userId).set({});
            db.collection("rooms").doc(response.id).set({
                roomId: response.id,
                roomName: roomName,
                roomImg: "https://business.ucr.edu/sites/g/files/rcwecm2116/files/styles/form_preview/public/icon-group.png?itok=3LzNDSRI"
            })
            setShowSuccess("Room " + roomName + " Created Successfully");
        }).catch(err => {
            console.log(err);
        })
    }

    const joinRoomHandler = (roomId) => {
        if (roomId === "") {
            setShowError("Invalid room Id");
            return;
        }
        db.collection("rooms").doc(roomId).onSnapshot(snapshot => {
            if (snapshot.exists) {
                contacts.doc(userData.userId).collection("rooms").doc(roomId).set({});
                db.collection("rooms").doc(roomId).collection("members").doc(userData.userId).set({});
                setShowSuccess("Room " + roomId + " Joined Successfully");
            } else {
                setShowError("Room ID doesn't exists");
            }
        })  
    }

    const joinRoomModal = () => {
        closeMenuHandler();
        setShowJoinRoom(true);
    }
    
    return (
        <>
            <AddUserModal
                show={showAddUser}
                closeModal={closeAllModals}
                addUserHandler={addUserHandler}
            />
            <CreateRoomModal
                show={showCreateRoom}
                closeModal={closeAllModals}
                createRoomHandler={createRoomHandler}
            />
            <JoinRoomModal
                show={showJoinRoom}
                closeModal={closeAllModals}
                joinRoomHandler={joinRoomHandler}
            />
            <Snackbar open={showError !== ""} autoHideDuration={6000} onClose={handleClose}>
                <MuiAlert onClose={handleClose} severity="error" elevation={6} variant="filled">
                    {showError}
                </MuiAlert>
            </Snackbar>
            <Snackbar open={showSuccess !== ""} autoHideDuration={6000} onClose={handleClose}>
                <MuiAlert onClose={handleClose} severity="success" elevation={6} variant="filled">
                    {showSuccess}
                </MuiAlert>
            </Snackbar>
            <div className="Sidebar">
                <Profile
                    show={showProfile}
                    userId={userData.userId}
                    userEmail={userData.userEmail}
                    imgURL={userData.userImg}
                    userName={userData.userName}
                    closeProfile={() => setShowProfile(false)} >

                </Profile>
                <div className="Sidebar_Header">
                    <div className="Sidebar_HeaderInfo">
                        {/* {userData.userImg} */}
                        <Avatar 
                            onClick={showProfileHandler} 
                            src={userData.userImg} >
                                <GroupRoundedIcon />
                        </Avatar>
                        <h3>{userData.userName}</h3>
                    </div>
                    <div className="Sidebar_Tools">
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
                            
                            <MenuItem onClick={showProfileHandler}>Profile</MenuItem>
                            <MenuItem color="dark" onClick={addUser}>Add Contact</MenuItem>
                            <MenuItem color="dark" onClick={joinRoomModal}>Join room</MenuItem>
                            <MenuItem color="dark" onClick={createRoomModal}>Create Room</MenuItem>
                            <MenuItem color="dark" onClick={logoutHandler}>Logout</MenuItem>
                            
                        </Menu>
                    </div>
                </div>

                <div className="Sidebar_Search">
                    <div className="Sidebar_SearchContainer">
                        <IconButton color="inherit">
                            <SearchOutlinedIcon />
                        </IconButton>
                        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Search or start new chat" type="text" />
                    </div>
                </div>

                <div className="Sidebar_Chat">
                    {
                        roomsLoading || usersLoading ? <CircularProgress /> :
                        <>
                            {   
                                userContactList.map(user => {
                                    if (!(new RegExp(input, "i").test(user.userName))) {
                                        return null;
                                    } 
                                    return <SidebarChat 
                                                key = {user.userId}
                                                Name={user.userName} 
                                                Id={user.userId} 
                                                Img={user.userImg} 
                                                Email={user.email} 
                                                lastMessage={user.lastMessage}
                                                online={usersLastUpdate[user.userId]?.online}
                                                lastSeen={usersLastUpdate[user.userId]?.lastSeen}
                                                type="user"
                                    />
                                    
                                }) 
                            }
                            {   
                                roomsList.map(room => {
                                    if (!(new RegExp(input, "i").test(room.roomName))) {
                                        return null;
                                    } 
                                    return <SidebarChat 
                                                key = {room.roomId}
                                                Name={room.roomName} 
                                                Id={room.roomId} 
                                                Img={room.roomImg}
                                                lastMessage={room.lastMessage}
                                                type="room"
                                    />
                                })
                            }
                        </>
                    }
                    
                </div>
            </div>
        </>
    )
}

export default Sidebar;