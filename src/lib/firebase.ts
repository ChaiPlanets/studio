// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaF6A2pCKyuFIac1eMgAGPvMUC-Ezsxas",
  authDomain: "fireflow-2akr8.firebaseapp.com",
  projectId: "fireflow-2akr8",
  storageBucket: "fireflow-2akr8.firebasestorage.app",
  messagingSenderId: "419454777311",
  appId: "1:419454777311:web:ba551672d8c675e4b4f66a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
