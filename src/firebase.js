import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAI-8CU6-9EGqu9X4TDQ9rYowrIPOOJqhw",
  authDomain: "elvare-a654b.firebaseapp.com",
  projectId: "elvare-a654b",
  storageBucket: "elvare-a654b.firebasestorage.app",
  messagingSenderId: "1015704662766",
  appId: "1:1015704662766:web:b1edf6e7ae1efce036f9ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };