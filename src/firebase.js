// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCo70p152ukD6262XPsO-dr6jYd9Qwdhg0",
  authDomain: "fixifiy-technology.firebaseapp.com",
  projectId: "fixifiy-technology",
  storageBucket: "fixifiy-technology.firebasestorage.app",
  messagingSenderId: "735622306651",
  appId: "1:735622306651:web:0a9c84f3336eddb6db187e",
  measurementId: "G-0F74NEP4G6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Authentication को Export करें
export const auth = getAuth(app);