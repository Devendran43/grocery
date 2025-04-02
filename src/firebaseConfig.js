// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCBhC0nQlC1bVgPiPCtuGPY-skRILm1yi8",
    authDomain: "devgrocery-11ebd.firebaseapp.com",
    projectId: "devgrocery-11ebd",
    storageBucket: "devgrocery-11ebd.firebasestorage.app",
    messagingSenderId: "1077256119724",
    appId: "1:1077256119724:web:f159a4b77d256dd2ebc609",
    measurementId: "G-KNJYJ0T4L4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };