import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC6fgPJj0VuTiELgv3JOgJSLQNoEC5N-EM",
    authDomain: "zocalo-dashboard.firebaseapp.com",
    projectId: "zocalo-dashboard",
    storageBucket: "zocalo-dashboard.firebasestorage.app",
    messagingSenderId: "722100102602",
    appId: "1:722100102602:web:f6f31f0608c636226d1b33",
    measurementId: "G-KHX389E0DG"
};

// Initialize Firebase (SSR friendly)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
