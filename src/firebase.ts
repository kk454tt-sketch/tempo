import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC01A6pw3-4a2KhPmHD0F4XPgcp1Bcb81Y",
  authDomain: "tempo-fbfbb.firebaseapp.com",
  projectId: "tempo-fbfbb",
  storageBucket: "tempo-fbfbb.firebasestorage.app",
  messagingSenderId: "680923044799",
  appId: "1:680923044799:web:c07cc4f5b7d442f822df0a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
