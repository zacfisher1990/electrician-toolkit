// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvIm1f_4pRj3SRCmEbpVvxCdIarOo5cTI",
  authDomain: "electrician-toolkit.firebaseapp.com",
  projectId: "electrician-toolkit",
  storageBucket: "electrician-toolkit.firebasestorage.app",
  messagingSenderId: "699587080269",
  appId: "1:699587080269:web:94181d9250b943e6152c04",
  measurementId: "G-ZVDDQ6J26T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Export auth as a named export
export { auth };
export default app;