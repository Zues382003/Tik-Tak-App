import firebase from 'firebase/compat/app'
import 'firebase/compat/storage'
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB3ezZvu0FRup2N-Bz2s1ljC4z2KF4tN3Q",
    authDomain: "tik-tak-41e69.firebaseapp.com",
    projectId: "tik-tak-41e69",
    storageBucket: "tik-tak-41e69.appspot.com",
    messagingSenderId: "292817641522",
    appId: "1:292817641522:web:4c27474b32c46082fadc2b",
    measurementId: "G-DCL1J826YB"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };