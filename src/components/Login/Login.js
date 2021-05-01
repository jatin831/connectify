import React from 'react';
import { useDispatch } from 'react-redux';

import { Button } from '@material-ui/core';
import { auth, provider } from "../../firebase";
import { SET_USER } from "../../reducers/authSlice";
import './Login.css';
import Img from '../../assets/connectify.svg';

const Login = () => {
    const dispatch = useDispatch();
    
    const signIn = () => {
        auth.signInWithPopup(provider)
            .then(result => {
                dispatch(SET_USER({
                    userId: result.user.uid,
                    token: result.user.refreshToken,
                    userImg: result.user.photoURL,
                    userName: result.user.displayName,
                    userEmail: result.user.email
                }))
            })
            .catch(err => {
                console.log(err);
                
            })
    }

    return (
        
        <div className="Login">
            <img src={Img} alt="" />
            <h1>Welcome to Connectify</h1>
            <Button onClick={signIn}>
                G+{" "}
                Sign in with Google 
            </Button>
        </div>
    )
}

export default Login;