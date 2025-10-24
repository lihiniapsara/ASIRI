import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBv6Hz4NCjHocN0_nZrszW67saPpwrYqwQ",
    authDomain: "asiri-health-app.firebaseapp.com",
    databaseURL: "https://asiri-health-app-default-rtdb.firebaseio.com",
    projectId: "asiri-health-app",
    storageBucket: "asiri-health-app.firebasestorage.app",
    messagingSenderId: "164935138431",
    appId: "1:164935138431:web:a73f2647e1911d4e4d534a",
    measurementId: "G-ZVWKLFTDPB"
};
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log('✅ Firebase initialized successfully (Firestore & Auth ready)');

