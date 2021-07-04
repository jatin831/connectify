import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import firebase from 'firebase';
import db from './firebase';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Chat from './components/Chat/Chat';
import Login from './components/Login/Login';
import AdminChat from './components/AdminChat/AdminChat'
import { selectUserData, GET_USER } from './reducers/authSlice';
import CircularProgress from '@material-ui/core/CircularProgress';

const App = () => {
  const [loading, setLoading] = useState(true);
  const userData = useSelector(selectUserData);
  const [isInterval, setIsInterval] = useState(false);
  const [update, setUpdate] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GET_USER());
    setLoading(false); 
  }, []);

  useEffect(() => {
    if (userData && userData.userId && !isInterval) {
      setInterval(() => {
        if (userData && userData.userId) {
          db.collection("contacts").doc(userData.userId).update({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
          })
        }
        setIsInterval(true);
        setUpdate(prevState => !prevState);
      }, 2 * 1000 * 60); // Update last seen every 2 minutes
    }
  }, [userData]);

  // let displayOutput = null;
  // if (loading) {
  //   displayOutput = <CircularProgress />
  // } else if (userData.token) {
  //   displayOutput = (
  //     <div className="App_Body">
  //       <Sidebar update={update} />
  //       <Switch>
  //         <Route path="/user/:userId" exact component={Chat} />
  //         <Route path="/room/:roomId" exact component={Chat} />
  //         <Route path="/" exact component={AdminChat} />
  //       </Switch>
  //     </div>
  //   )
  // } else {
  //   displayOutput = <Login />;
  // }

  return (
    <div className="App">
      { loading ? (
          <CircularProgress />
        ) : userData.token ? (
          <div className="App_Body">
            <Sidebar update={update} />
            <Switch>
              <Route path="/user/:userId" exact component={Chat} />
              <Route path="/room/:roomId" exact component={Chat} />
              <Route path="/" exact component={AdminChat} />
            </Switch>
          </div>
        ) : (
          <Login />
        ) 
      }
    </div>
  );
}

export default App;
