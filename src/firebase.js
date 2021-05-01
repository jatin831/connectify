import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyCcX6qMtuCIY0BOH_X9BkpruPkxsdKMWdo",
    authDomain: "connectify-5fda9.firebaseapp.com",
    projectId: "connectify-5fda9",
    storageBucket: "connectify-5fda9.appspot.com",
    messagingSenderId: "606463120529",
    appId: "1:606463120529:web:cc8e1160cc23d55cec5b30"
  };

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
export const auth = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider();
export const storage = firebase.storage();

export default db;