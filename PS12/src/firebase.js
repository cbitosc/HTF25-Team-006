// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-oZrCIspHspygPp4OZayaGniDEMygyqw",
  authDomain: "ps12-138be.firebaseapp.com",
  projectId: "ps12-138be",
  storageBucket: "ps12-138be.firebasestorage.app",
  messagingSenderId: "398005754417",
  appId: "1:398005754417:web:78ee897b52894d58db5310",
  measurementId: "G-FVNM87BG5N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize and export Firebase Auth and Google provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export default app;