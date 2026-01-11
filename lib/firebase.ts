import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Google Calendar Credentials (Global Defaults)
export const GOOGLE_CALENDAR_CLIENT_ID = "97657199919-hldrj62m5h8q4p47k6do5dm2cjj0hnih.apps.googleusercontent.com";
// Usar la API Key del proyecto Firebase para evitar error de "different projects"
export const GOOGLE_CALENDAR_API_KEY = firebaseConfig.apiKey;

// Request calendar access during initial login
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');

export { db, storage, auth, googleProvider };
